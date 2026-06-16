import { CSSProperties, ReactNode } from "react";
import { Color } from "../utils/css";
import styles from "./Badge.module.scss";

export type BadgeProps = {
  color: Color;
  size: "s" | "m" | "l";
  status?: "empty" | "in-progress" | "completed";
  active?: boolean;

  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Badge({
  color,
  size,
  status,
  active,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        className,
        styles.Badge,
        styles[`size-${size}`],
        styles[`color-${color}`],
        status && styles[`status-${status}`],
        active && styles.active,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
