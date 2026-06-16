import { Toast } from "radix-ui";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { BiX } from "react-icons/bi";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col } from "../layout/FlexBox";
import styles from "./ToastProvider.module.scss";

export type ToastType = "error" | "success" | "warning" | "info" | "neutral";

type ToastProps = {
  type: ToastType;
  title?: ReactNode;
  message: ReactNode;
  icon?: ReactNode;
  duration?: number;
};

type ToastState = ToastProps & {
  open: boolean;
  id: number;
  paused: boolean;
};

const ToastContext = createContext<(toast: ToastProps) => void>(() => {});

export function useToast() {
  return {
    show: useContext(ToastContext),
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const closeToast = useCallback((id: number) => {
    setToasts((toasts) =>
      toasts.map((toast) => ({
        ...toast,
        open: toast.id === id ? false : toast.open,
      })),
    );
  }, []);

  const openToast = useCallback((toast: ToastProps) => {
    const id = Math.random();
    setToasts((toasts) => [
      ...toasts,
      { ...toast, id, open: true, paused: false },
    ]);
  }, []);

  const setToastPaused = useCallback((id: number, paused: boolean) => {
    setToasts((toasts) =>
      toasts.map((toast) => ({
        ...toast,
        paused: toast.id === id ? paused : toast.paused,
      })),
    );
  }, []);

  return (
    <ToastContext.Provider value={openToast}>
      <Toast.Provider>
        {children}

        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className={[styles.Root, styles[toast.type]].join(" ")}
            open={toast.open}
            onOpenChange={() => closeToast(toast.id)}
            onPause={() => setToastPaused(toast.id, true)}
            onResume={() => setToastPaused(toast.id, false)}
            duration={toast.duration}
          >
            {(toast.type !== "neutral" || toast.icon) && (
              <IconControl as="span" size="s" color="currentColor" my={1}>
                {toast.icon ??
                  {
                    success: <FaCheckCircle />,
                    warning: <FaExclamationTriangle />,
                    error: <FaExclamationCircle />,
                    info: <FaInfoCircle />,
                    neutral: null,
                  }[toast.type]}
              </IconControl>
            )}

            <Col className={styles.Content} my={1}>
              {toast.title && (
                <Toast.Title className={styles.Title} asChild>
                  <Text as="h3" size="body" color="currentColor" m={0}>
                    {toast.title}
                  </Text>
                </Toast.Title>
              )}
              <Toast.Description className={styles.Description}>
                {toast.message}
              </Toast.Description>
            </Col>

            <Toast.Action asChild altText="Fechar">
              <IconControl as="button" size="s" color="muted">
                <BiX />
              </IconControl>
            </Toast.Action>

            {toast.duration !== Infinity && (
              <span className={styles.ProgressTrack} aria-hidden="true">
                <span
                  className={[styles.Progress, toast.paused && styles.paused]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ animationDuration: `${toast.duration || 5000}ms` }}
                />
              </span>
            )}
          </Toast.Root>
        ))}

        <Toast.Viewport className={styles.Viewport} />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
