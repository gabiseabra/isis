import { omit } from "@isis/common/utils/object";
import { CSSProperties, ReactNode } from "react";
import * as css from "../utils/css";
import { MarginProps, PaddingProps } from "../utils/css";
import styles from "./IconControl.module.scss";

export type IconControlProps = {
  as?: "div" | "span" | "a" | "button";

  size: "xs" | "s" | "m" | "l" | "xl" | "auto";
  color?: css.Color | "muted" | "currentColor";
  radius?: number | `${number}%`;
  height?: number | string;
  width?: number | string;

  badge?: string;

  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;

  disabled?: boolean;
  pressed?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
} & PaddingProps &
  MarginProps;

export function IconControl({
  as: Component = "span",
  size,
  color = "currentColor",
  radius,
  width,
  height,
  badge,
  children,
  className,
  style,
  disabled,
  pressed,
  readOnly,
  onClick,
  ...props
}: IconControlProps) {
  return (
    <Component
      className={[className, styles.Root].filter(Boolean).join(" ")}
      style={{
        borderRadius: typeof radius === "number" ? css.radius(radius) : radius,
        height,
        width,
        ...style,
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
      }}
      onClick={disabled || readOnly ? undefined : onClick}
      disabled={disabled}
      data-size={size}
      data-color={color}
      data-disabled={disabled || undefined}
      data-pressed={pressed || undefined}
      data-clickable={(onClick && !disabled && !readOnly) || undefined}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    >
      {children}

      {!!badge && <span className={styles.Badge}>{badge}</span>}
    </Component>
  );
}
