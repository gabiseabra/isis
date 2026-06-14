import { omit } from "@isis/common/utils/object";
import { CSSProperties, ReactNode } from "react";
import * as css from "../utils/css";
import { MarginProps, PaddingProps } from "../utils/css";
import styles from "./IconControl.module.scss";

export type IconControlProps = {
  as: "div" | "span" | "a" | "button";

  size: "xs" | "s" | "m" | "l" | "xl" | "auto";
  color: css.Color | "currentColor";

  badge?: string;

  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;

  disabled?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
} & PaddingProps &
  MarginProps;

export function IconControl({
  as: Component,
  size,
  color,
  badge,
  children,
  className,
  style,
  disabled,
  readOnly,
  onClick,
  ...props
}: IconControlProps) {
  // apply PX size inline for RSS feed
  const pxSize = {
    xs: 12,
    s: 16,
    m: 24,
    l: 32,
    xl: 48,
    auto: undefined,
  }[size];

  return (
    <Component
      className={[
        className,
        styles.icon,
        styles[`size-${size}`],
        color && styles[`color-${color}`],
        disabled && styles[`color-gray`],
        onClick && !disabled && !readOnly && styles.clickable,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        display: "inline-block",
        width: pxSize,
        height: pxSize,
        ...style,
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
      }}
      onClick={disabled || readOnly ? undefined : () => onClick?.()}
      disabled={disabled}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    >
      {children}

      {!!badge && <span className={styles.badge}>{badge}</span>}
    </Component>
  );
}
