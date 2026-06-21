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
      className={[styles.Badge, className].filter(Boolean).join(" ")}
      data-active={active || undefined}
      data-color={color}
      data-size={size}
      data-status={status}
      {...props}
    />
  );
}
