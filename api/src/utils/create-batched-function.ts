import { withResolvers } from "@isis/common/promise";
import { hash } from "@isis/common/utils/hash";
import { NonEmpty } from "@isis/common/utils/non-empty";

export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export type BatchedFunctionOptions<T> = {
  /** Max number of items per batch. */
  maxBatchSize: number;
  /** Max age of a batch in milliseconds. */
  maxBatchAgeMs: number;
  /** Function used to identify which batch an argument belongs to. */
  key: (value: T) => Primitive;
};

type BatchedCall<T, R> = {
  arg: T;
  resolve: (value: R) => void;
  reject: (reason: unknown) => void;
};

type Batch<T, R> = {
  calls: BatchedCall<T, R>[];
  timeoutId?: NodeJS.Timeout;
};

/**
 * Creates a function that batches calls made close together.
 *
 * The handler must return one result per input argument, in the same order.
 * If the handler rejects, every promise in that batch rejects.
 */
export function createBatchedFunction<T, R>(
  handler: (args: NonEmpty<T>) => Promise<R[]>,
  options: BatchedFunctionOptions<T>,
) {
  const batches = new Map<Primitive, Batch<T, R>>();

  function flush(batchKey: Primitive) {
    const batch = batches.get(batchKey);

    if (!batch) {
      return;
    }

    batches.delete(batchKey);

    if (batch.timeoutId) {
      clearTimeout(batch.timeoutId);
    }

    if (!NonEmpty.isNonEmpty(batch.calls)) {
      return;
    }

    const calls = batch.calls;

    handler(NonEmpty.map(calls, (call) => call.arg)).then(
      (results) => {
        if (results.length !== calls.length) {
          const error = new Error(
            `Expected ${calls.length} results, got ${results.length}`,
          );

          for (const { reject } of calls) {
            reject(error);
          }

          return;
        }

        for (let i = 0; i < calls.length; i++) {
          calls[i]?.resolve(results[i] as R);
        }
      },
      (error) => {
        for (const { reject } of calls) {
          reject(error);
        }
      },
    );
  }

  return (arg: T): Promise<R> => {
    const batchKey = options.key(arg);
    const { promise, resolve, reject } = withResolvers<R>();
    const batch = batches.get(batchKey) ?? { calls: [] };

    batch.calls.push({ arg, resolve, reject });
    batches.set(batchKey, batch);

    if (batch.calls.length >= options.maxBatchSize) {
      flush(batchKey);
      return promise;
    }

    batch.timeoutId ??= setTimeout(
      () => flush(batchKey),
      options.maxBatchAgeMs,
    );

    return promise;
  };
}

export type DeduplicatedFunctionOptions<T extends readonly unknown[]> = {
  /** Function used to identify duplicate in-flight calls. */
  hash?: (...args: T) => Primitive;
};

export function defaultHashFn<T extends readonly unknown[]>(...args: T) {
  return hash(args);
}

/**
 * Creates a function that reuses the same promise for duplicate in-flight calls.
 *
 * This is not result memoization: the stored promise is removed after it settles.
 */
export function createDeduplicatedFunction<T extends readonly unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options?: DeduplicatedFunctionOptions<T>,
) {
  const promises = new Map<string, Promise<R>>();
  const hashFn = options?.hash ?? defaultHashFn;

  return (...args: T): Promise<R> => {
    const key = String(hashFn(...args));
    const existing = promises.get(key);

    if (existing) {
      return existing;
    }

    const promise = fn(...args).finally(() => {
      promises.delete(key);
    });

    promises.set(key, promise);

    return promise;
  };
}
