import {
  extractErrorMessage,
  isErrorRecoverable,
} from "@isis/common/utils/error";
import React, { ReactNode, useState } from "react";
import { BiErrorAlt } from "react-icons/bi";
import { FaArrowsRotate } from "react-icons/fa6";
import { IconControl } from "../display/IconControl.js";
import { Text } from "../display/Text.js";
import { Button } from "../form/Button.js";
import { Col } from "../layout/FlexBox.js";
import { EmptyState } from "./EmptyState";
import { Spinner } from "./Spinner";

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
    <Boundary fallback={error} onError={onError}>
      <React.Suspense fallback={loading}>{children}</React.Suspense>
    </Boundary>
  );
}

export type PageSuspenseBoundaryProps = {
  children: ReactNode;
  /**
   * Name of the resource being loaded.
   */
  resourceName: string;
  onRetry?: () => void;
  onError?: (error: unknown) => void;
};

export function PageSuspenseBoundary({
  resourceName,
  onRetry,
  ...props
}: PageSuspenseBoundaryProps) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <SuspenseBoundary
      key={retryKey}
      {...props}
      loading={
        <Col flex={1} alignX="center" alignY="center">
          <Spinner size="l" />
        </Col>
      }
      error={(error) => (
        <Col flex={1} alignX="center" alignY="center">
          <EmptyState
            size="l"
            color="red"
            icon={<BiErrorAlt />}
            title={`Ocorreu um erro carregando ${resourceName}.`}
          >
            <Text as="p">{extractErrorMessage(error)}</Text>

            {isErrorRecoverable(error) && onRetry && (
              <Button
                variant="link"
                color="red"
                onClick={() => {
                  setRetryKey((k) => k + 1);
                  onRetry();
                }}
              >
                <IconControl color="currentColor" as="span" size="xs">
                  <FaArrowsRotate />
                </IconControl>
                Tentar de novo
              </Button>
            )}
          </EmptyState>
        </Col>
      )}
    />
  );
}

/** Utilities */

type BoundaryState = { error: unknown | null };

class Boundary extends React.Component<
  {
    fallback: (error: unknown) => ReactNode;
    onError?: (error: unknown) => void;
    children: ReactNode;
  },
  BoundaryState
> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
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
