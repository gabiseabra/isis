import { omit } from "@isis/common/utils/object";
import { Slot } from "radix-ui";
import { CSSProperties, ReactNode } from "react";
import * as css from "../utils/css";
import { MarginProps, PaddingProps } from "../utils/css";
import styles from "./IconControl.module.scss";

export type IconControlProps = {
  as?: "div" | "span" | "a";
  asChild?: boolean;

  size?: "xs" | "s" | "m" | "l" | "xl" | "auto";
  color?: css.Color | "muted" | "disabled" | "currentColor";
  height?: number | string;
  width?: number | string;

  badge?: string;

  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;

  pressed?: boolean;
} & PaddingProps &
  MarginProps;

export function IconControl({
  asChild,
  as: _as = "span",
  size,
  color = "currentColor",
  width,
  height,
  className,
  style,
  pressed,
  ...props
}: IconControlProps) {
  const Component = asChild ? Slot.Root : _as;
  return (
    <Component
      className={[className, styles.IconControl].filter(Boolean).join(" ")}
      style={{
        height,
        width,
        ...style,
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
      }}
      data-size={size}
      data-color={color}
      data-pressed={pressed || undefined}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    />
  );
}
