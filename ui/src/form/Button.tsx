import { type ComponentProps, type ReactNode } from "react";
import { Spinner } from "../feedback/Spinner";
import { Color } from "../utils/css";
import styles from "./Button.module.scss";

export type ButtonProps = Omit<ComponentProps<"button">, "color"> & {
  left?: ReactNode;
  loading?: boolean;
  pressed?: boolean;
  right?: ReactNode;
  variant?: "primary" | "secondary" | "sheer" | "link";
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
  pressed,
  left,
  right,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[styles.Button, className].filter(Boolean).join(" ")}
      aria-busy={loading || undefined}
      aria-pressed={pressed || undefined}
      data-color={color}
      data-loading={loading || undefined}
      data-pressed={pressed || undefined}
      data-size={size}
      data-variant={variant}
      disabled={disabled}
      type={type}
      {...props}
    >
      <span className={styles.Content}>
        {!!left && (
          <span className={[styles.Slot, styles.Left].join(" ")}>{left}</span>
        )}
        {children}
        {!!right && (
          <span className={[styles.Slot, styles.Right].join(" ")}>{right}</span>
        )}
      </span>
      {loading && <Spinner size="s" className={styles.Spinner} />}
    </button>
  );
}
