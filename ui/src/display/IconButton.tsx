import { ComponentProps } from "react";
import * as css from "../utils/css";
import styles from "./IconButton.module.scss";

export type IconButtonProps = {
  variant?: "solid" | "sheer";
  color?: css.Color | "muted" | "disabled" | "currentColor";
  pressed?: boolean;
  radius?: number;
} & ComponentProps<"button">;

export function IconButton({
  variant = "sheer",
  color = "currentColor",
  radius,
  className,
  pressed,
  style,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={[className, styles.IconButton].filter(Boolean).join(" ")}
      style={{
        borderRadius: typeof radius === "number" ? css.radius(radius) : radius,
        ...style,
      }}
      data-variant={variant}
      data-color={color}
      data-pressed={pressed || undefined}
      {...props}
    />
  );
}
