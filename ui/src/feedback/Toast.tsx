import { Toast as RxToast } from "radix-ui";
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
import { IconButton } from "../display/IconButton";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col } from "../layout/FlexBox";
import styles from "./Toast.module.scss";

export type ToastType = "error" | "success" | "warning" | "info" | "neutral";

export type ToastProps = {
  open: boolean;
  onClose: () => void;
  type: ToastType;
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  duration?: number;
  paused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
};

export type ToastParams = Omit<
  ToastProps,
  "open" | "onClose" | "paused" | "onPause" | "onResume" | "children"
> & {
  message: ReactNode;
};

const ToastContext = createContext<(toast: ToastParams) => void>(() => {});

export function useToast() {
  return {
    show: useContext(ToastContext),
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<
    (Omit<ToastParams, "onClose"> & {
      id: number;
      open: boolean;
      paused: boolean;
    })[]
  >([]);

  const closeToast = useCallback((id: number) => {
    setToasts((toasts) =>
      toasts.map((toast) => ({
        ...toast,
        open: toast.id === id ? false : toast.open,
      })),
    );
  }, []);

  const openToast = useCallback((toast: ToastParams) => {
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
      <RxToast.Provider>
        {children}

        {toasts.map(({ id, message, ...toast }) => (
          <Toast
            key={id}
            {...toast}
            onClose={() => closeToast(id)}
            onPause={() => setToastPaused(id, true)}
            onResume={() => setToastPaused(id, false)}
          >
            {message}
          </Toast>
        ))}

        <RxToast.Viewport className={styles.Viewport} />
      </RxToast.Provider>
    </ToastContext.Provider>
  );
}

export function Toast({
  type,
  open,
  onClose,
  title,
  children,
  icon,
  duration,
  paused,
  onPause,
  onResume,
}: ToastProps) {
  return (
    <RxToast.Root
      className={styles.Root}
      data-type={type}
      open={open}
      onOpenChange={onClose}
      onPause={onPause}
      onResume={onResume}
      duration={duration}
    >
      {(type !== "neutral" || icon) && (
        <IconControl size="s" color="currentColor" my={1}>
          {icon ??
            {
              success: <FaCheckCircle />,
              warning: <FaExclamationTriangle />,
              error: <FaExclamationCircle />,
              info: <FaInfoCircle />,
              neutral: null,
            }[type]}
        </IconControl>
      )}

      <Col className={styles.Content} my={1}>
        {title && (
          <RxToast.Title className={styles.Title} asChild>
            <Text
              as="h3"
              size="body"
              color="currentColor"
              font="sans-serif"
              m={0}
            >
              {title}
            </Text>
          </RxToast.Title>
        )}
        <RxToast.Description className={styles.Description}>
          {children}
        </RxToast.Description>
      </Col>

      <RxToast.Action asChild altText="Fechar">
        <IconButton>
          <IconControl size="s" color="muted">
            <BiX />
          </IconControl>
        </IconButton>
      </RxToast.Action>

      {duration !== Infinity && (
        <span className={styles.ProgressTrack} aria-hidden="true">
          <span
            className={styles.Progress}
            data-paused={paused || undefined}
            style={{ animationDuration: `${duration || 5000}ms` }}
          />
        </span>
      )}
    </RxToast.Root>
  );
}
