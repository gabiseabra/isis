import React, { ReactNode } from "react";

export type ErrorBoundaryProps = {
  fallback: (error: unknown) => ReactNode;
  onError?: (error: unknown) => void;
  children: ReactNode;
};

type ErrorBoundaryState = { error: unknown | null };

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (error) {
      return fallback(error);
    }

    return children;
  }
}
