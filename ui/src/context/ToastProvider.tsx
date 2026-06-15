import { Toast } from "radix-ui";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { FaXmark } from "react-icons/fa6";
import { IconControl } from "../display/IconControl";
import styles from "./ToastProvider.module.scss";

export type ToastType = "error" | "success" | "warning" | "neutral";

type ToastProps = {
  type: ToastType;
  title?: ReactNode;
  message: ReactNode;
  duration?: number;
};

const ToastContext = createContext<(toast: ToastProps) => void>(() => {});

export function useToast() {
  return {
    show: useContext(ToastContext),
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<
    (ToastProps & { open: boolean; id: number })[]
  >([]);

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
    setToasts((toasts) => [...toasts, { ...toast, id, open: true }]);
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
            duration={toast.duration}
          >
            <div className={styles.Content}>
              {toast.title && (
                <Toast.Title className={styles.Title}>
                  {toast.title}
                </Toast.Title>
              )}
              <Toast.Description className={styles.Description}>
                {toast.message}
              </Toast.Description>
            </div>
            <Toast.Action asChild altText="Fechar">
              <IconControl as="button" size="s" color="currentColor">
                <FaXmark />
              </IconControl>
            </Toast.Action>
          </Toast.Root>
        ))}

        <Toast.Viewport className={styles.Viewport} />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
