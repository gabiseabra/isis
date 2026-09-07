import { omit } from "@isis/common/utils/object";
import { ComponentProps } from "react";
import * as css from "../utils/css";
import styles from "./IconButton.module.scss";

export type IconButtonProps = {
  variant?: "solid" | "sheer";
  color?: css.Color | "currentColor";
  pressed?: boolean;
  radius?: number;
} & ComponentProps<"button"> &
  css.MarginProps &
  css.PaddingProps;

export function IconButton({
  variant = "sheer",
  color,
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
        ...css.getMarginStyles(props),
        ...css.getPaddingStyles(props),
        ...style,
      }}
      data-variant={variant}
      data-color={color}
      data-pressed={pressed || undefined}
      {...omit(props, [...css.marginProps, ...css.paddingProps])}
    />
  );
}
