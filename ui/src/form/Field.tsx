import { type ComponentProps, type ReactNode } from "react";
import { IconControl } from "../display/IconControl";
import styles from "./Field.module.scss";

export type FieldProps = ComponentProps<"div"> & {
  htmlFor?: string;
  label?: ReactNode;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
};

export function Field({
  htmlFor,
  label,
  required,
  description,
  error,
  className = "",
  children,
  ...props
}: FieldProps) {
  return (
    <div
      className={[styles.Field, className].filter(Boolean).join(" ")}
      {...props}
    >
      {label && (
        <label className={styles.Label} htmlFor={htmlFor}>
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
  );
}
