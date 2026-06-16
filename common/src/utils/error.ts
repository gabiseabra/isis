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

export function never(message: string): never {
  throw new Error(message);
}
