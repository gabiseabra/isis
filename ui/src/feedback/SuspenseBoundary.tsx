import React, { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

export type SuspenseBoundaryProps = {
  children: ReactNode;
  loading: ReactNode;
  error: (error: unknown) => ReactNode;
  onError?: (error: unknown) => void;
};

/**
 * Combines an error boundary with React Suspense.
 * Children may suspend by throwing a Promise and may fail by throwing an error.
 */
export function SuspenseBoundary({
  children,
  loading,
  error,
  onError,
}: SuspenseBoundaryProps) {
  return (
    <ErrorBoundary fallback={error} onError={onError}>
      <React.Suspense fallback={loading}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}
