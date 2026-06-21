import { type ComponentProps, type ReactNode } from "react";
import { Spinner } from "../feedback/Spinner";
import { Color } from "../utils/css";
import styles from "./Button.module.scss";

export type ButtonProps = Omit<ComponentProps<"button">, "color"> & {
  left?: ReactNode;
  loading?: boolean;
  right?: ReactNode;
  variant?: "primary" | "secondary" | "link";
  color?: Color | "currentColor";
  size?: "l" | "m" | "s";
};

export function Button({
  className = "",
  type = "button",
  variant = "secondary",
  color = "default",
  size = "m",
  disabled,
  loading,
  left,
  right,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        styles.Button,
        styles[`variant-${variant}`],
        styles[`color-${color}`],
        styles[`size-${size}`],
        loading && styles.loadingState,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-busy={loading || undefined}
      disabled={disabled}
      type={type}
      {...props}
    >
      <span className={styles.Content}>
        {!!left && <span className={styles.Slot}>{left}</span>}
        {children}
        {!!right && <span className={styles.Slot}>{right}</span>}
      </span>
      {loading && <Spinner size="s" className={styles.Spinner} />}
    </button>
  );
}
