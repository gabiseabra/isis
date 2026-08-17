import { ORPCError } from "@orpc/contract";

export function extractErrorMessage(
  error: unknown,
  fallback: string = "Erro desconhecido",
) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function extractErrorCode(error: unknown) {
  if (error instanceof ORPCError) {
    return error.status;
  }
}

export function isErrorRecoverable(error: unknown) {
  const code = extractErrorCode(error);

  if (!code) return false;

  // Can't recover from all 400's or 501 (not implemented)
  return Math.floor(code / 100) !== 4 && code !== 501;
}

export function never(messageOrError: string | Error): never {
  if (messageOrError instanceof Error) throw messageOrError;
  throw new Error(messageOrError);
}

type AnyCtor<T> = { new (...args: any[]): T };

type ErrorHandler<T> = {
  (error: unknown): T;
  catch<E extends Error>(
    cls: AnyCtor<E>,
    handler: (error: E) => T,
  ): ErrorHandler<T>;
};

export function createErrorHandler<T = never>(): ErrorHandler<T> {
  const handlers = new Map<AnyCtor<Error>, (error: Error) => T>();

  const instance: ErrorHandler<T> = Object.assign(
    function handle(error: unknown) {
      for (const [cls, handler] of handlers.entries()) {
        if (error instanceof cls) return handler(error);
      }
      throw error;
    },
    {
      catch<E extends Error>(cls: AnyCtor<E>, handler: (error: E) => T) {
        handlers.set(cls, handler as (error: Error) => T);
        return instance;
      },
    },
  );

  return instance;
}
