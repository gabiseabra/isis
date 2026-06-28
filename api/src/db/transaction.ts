import { UUID } from "@isis/common/dto/uuid";
import { inTransaction, runWithStoredClient, useClient } from "./client";

/**
 * Options for transactions.
 */
export type TransactionOptions = {
  /**
   * The isolation level of the transaction.
   * Defaults to the postgres default: READ COMMITTED.
   */
  isolationLevel?: IsolationLevel;

  /**
   * The amount of time any statement is allowed to run for within this transaction.
   * Defaults to 30 seconds.
   */
  statementTimeoutMs?: number;
};

const defaultTransactionOptions = {
  statementTimeoutMs: 30 * 60_000,
} as const satisfies Partial<TransactionOptions>;

export type IsolationLevel =
  | "READ UNCOMMITTED"
  | "READ COMMITTED"
  | "REPEATABLE READ"
  | "SERIALIZABLE";

/**
 * Creates a transactional context: every query executed within the context will be part of the same transaction.
 * Throwing an error will cause the transaction to be rolled back.
 * Alternatively, you can return a value and rollback using the {@link rollback} function.
 */
export async function transaction<T>(
  tx: () => Promise<T | TransactionRollback<T>>,
  options?: TransactionOptions,
): Promise<T> {
  if (inTransaction()) {
    throw new Error("Nested transactions are not supported");
  }

  using client = await useClient();

  await client.query("BEGIN");

  try {
    const { isolationLevel, statementTimeoutMs } = {
      ...defaultTransactionOptions,
      ...options,
    };

    if (isolationLevel) {
      await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
    }

    if (statementTimeoutMs) {
      await client.query(`SET LOCAL statement_timeout = ${statementTimeoutMs}`);
    }

    const transactionId = UUID.create();
    const result = await runWithStoredClient({ transactionId, client }, tx);

    if (isTransactionRollback(result)) {
      await client.query("ROLLBACK");
      return result.value;
    }

    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
}

const rollbackSymbol = Symbol("rollback");
export type TransactionRollback<T> = {
  value: T;
  __meta: typeof rollbackSymbol;
};

export function rollback<T>(value: T): TransactionRollback<T> {
  return {
    value,
    __meta: rollbackSymbol,
  };
}

function isTransactionRollback<T>(
  value: T | TransactionRollback<T>,
): value is TransactionRollback<T> {
  return (
    value &&
    typeof value === "object" &&
    "__meta" in value &&
    value.__meta === rollbackSymbol
  );
}
