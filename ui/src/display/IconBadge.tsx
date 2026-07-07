import { ComponentProps, ReactNode } from "react";
import { Color } from "../utils/css";
import styles from "./IconBadge.module.scss";

export type IconBadgePosition =
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

export type IconBadgeProps = {
  badge: ReactNode;
  color?: Color | "disabled" | "muted" | "transparent";
  position?: IconBadgePosition;
  children: ReactNode;
} & Omit<ComponentProps<"span">, "children" | "color">;

export function IconBadge({
  badge,
  color,
  position = "top-end",
  className,
  children,
  ...props
}: IconBadgeProps) {
  return (
    <span
      className={[styles.IconBadge, className].filter(Boolean).join(" ")}
      data-color={color}
      data-position={position}
      {...props}
    >
      {children}
      <span className={styles.Badge}>{badge}</span>
    </span>
  );
}
