import {
  createContext,
  FocusEvent,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import styles from "./Field.module.scss";

const FieldContext = createContext<{
  name?: string;
  isTouched: boolean;
  isError: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}>({
  isTouched: false,
  isError: false,
});

export function useField<Element extends HTMLElement>(props: {
  onFocus?: (e: FocusEvent<Element>) => void;
  onBlur?: (e: FocusEvent<Element>) => void;
}) {
  const ctx = useContext(FieldContext);

  return {
    ...ctx,
    onFocus(e: FocusEvent<Element>) {
      props.onFocus?.(e);
      ctx.onFocus?.();
    },
    onBlur(e: FocusEvent<Element>) {
      props.onBlur?.(e);
      ctx.onBlur?.();
    },
  };
}

export type FieldProps = ComponentProps<"div"> & {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
};

export function Field({
  name,
  label,
  description,
  error,
  className = "",
  children,
  ...props
}: FieldProps) {
  const [isTouched, setIsTouched] = useState(false);
  return (
    <FieldContext.Provider
      value={{
        name,
        isTouched,
        isError: !!error,
        onBlur() {
          setIsTouched(true);
        },
      }}
    >
      <div
        className={[styles.Field, className].filter(Boolean).join(" ")}
        {...props}
      >
        {label && (
          <label className={styles.Label} htmlFor={name}>
            {label}
          </label>
        )}

        {children}

        {description && <div className={styles.Description}>{description}</div>}

        {error && <div className={styles.Error}>{error}</div>}
      </div>
    </FieldContext.Provider>
  );
}
