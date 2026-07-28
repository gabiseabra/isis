import { never } from "@isis/common/utils/error";
import { AsyncLocalStorage } from "node:async_hooks";
import pg from "pg";
import { onShutDown } from "../runtime/shut-down";

let globalPool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? never("DATABASE_URL not configured"),
});

/**
 * A pool client whose lifecycle is managed.
 */
type ManagedPoolClient = Omit<pg.PoolClient, "release">;

/**
 * A pool client that automatically releases itself when disposed.
 */
type DisposablePoolClient = ManagedPoolClient & Disposable;

type PgClientContext = {
  transactionId?: string;
  client?: DisposablePoolClient;
};

const als = new AsyncLocalStorage<PgClientContext | undefined>();

export const PgClient = {
  /**
   * Returns a pool client.
   * If called in {@link transaction} or {@link stickyClient}, it will return the client made for that context.
   * If not, it will return a fresh client that is disposed at the end of the call.
   *
   * Direct use is discouraged unless you need to run raw queries.
   */
  async usePool(): Promise<DisposablePoolClient> {
    const storedClient = getStoredClient();

    if (storedClient) {
      // the stored client is already managed, so we should do nothing on its disposal.
      // to make sure that it can still be disposed in the end, back up the original dispose function and restore it when it is disposed locally.
      const dispose = storedClient.client[Symbol.dispose];

      storedClient.client[Symbol.dispose] = () => {
        storedClient.client[Symbol.dispose] = dispose;
      };

      return storedClient.client;
    }

    const client = await globalPool.connect();
    let released = false;
    return Object.assign(client, {
      [Symbol.dispose]: () => {
        if (released) return;
        client.release();
        released = true;
      },
    });
  },

  async close() {
    await globalPool?.end();
  },

  async setUrl(databaseUrl: string) {
    await PgClient.close();
    globalPool = new pg.Pool({ connectionString: databaseUrl });
  },

  async withUrl<T>(databaseUrl: string, fn: () => Promise<T>) {
    const previousPool = globalPool;
    globalPool = new pg.Pool({ connectionString: databaseUrl });

    try {
      return await fn();
    } finally {
      await PgClient.close();
      globalPool = previousPool;
    }
  },

  escapeIdentifier(identifier: string) {
    return pg.escapeIdentifier(identifier);
  },

  run<T>(
    context: PgClientContext & { client: DisposablePoolClient },
    fn: () => T,
  ) {
    const _storedClient: PgClientContext = context;

    return als.run(_storedClient, () =>
      Promise.resolve()
        .then(fn)
        .finally(() => {
          _storedClient.client = undefined;
        }),
    );
  },

  getTransactionId(): string | null {
    return getStoredClient()?.transactionId ?? null;
  },

  inTransaction(): boolean {
    return PgClient.getTransactionId() !== null;
  },

  /**
   * Gets rid of a transactional context.
   * Useful for things that should never be rolled back, e.g. incrementing a counter.
   */
  async escapeTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return await als.exit(fn);
  },
};

function getStoredClient():
  | (PgClientContext & { client: DisposablePoolClient })
  | undefined {
  const storedClient = als.getStore();

  if (!storedClient) {
    return undefined;
  }

  const { client } = storedClient;

  if (!client) {
    // We are in a context where a client was used, but it has already been released.
    // This is likely a result of creating background jobs within transactions or stickyClients.
    throw new Error("Cannot use a released client.");
  }

  return { ...storedClient, client };
}

onShutDown(async () => {
  await PgClient.close();
});
