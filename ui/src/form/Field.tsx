import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { IconControl } from "../display/IconControl";
import styles from "./Field.module.scss";

const FieldContext = createContext<{
  id?: string;
  required?: boolean;
  isTouched?: boolean;
  setTouched(): void;
}>({
  setTouched() {},
});

export function useField() {
  return useContext(FieldContext);
}

export type FieldProps = Omit<ComponentProps<"div">, "id"> & {
  id: string;
  label?: ReactNode;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
};

export function Field({
  id,
  label,
  required,
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
        id,
        required,
        isTouched,
        setTouched() {
          setIsTouched(true);
        },
      }}
    >
      <div
        className={[styles.Field, className].filter(Boolean).join(" ")}
        {...props}
      >
        {label && (
          <label className={styles.Label} htmlFor={id}>
            {label}
            {required && (
              <IconControl size="s" color="red">
                *
              </IconControl>
            )}
          </label>
        )}

        {children}

        {description && <div className={styles.Description}>{description}</div>}

        {error && <div className={styles.Error}>{error}</div>}
      </div>
    </FieldContext.Provider>
  );
}
