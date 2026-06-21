import { omit } from "@isis/common/utils/object";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import * as css from "../utils/css";
import { MarginProps, PaddingProps } from "../utils/css";
import styles from "./IconControl.module.scss";

export type IconControlProps = {
  as: "div" | "span" | "a" | "button";

  size: "xs" | "s" | "m" | "l" | "xl" | "auto";
  color?: css.Color | "muted" | "currentColor";

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
  color = "currentColor",
  badge,
  children,
  className,
  style,
  disabled,
  readOnly,
  onClick,
  ...props
}: IconControlProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [autoSize, setAutoSize] = useState<number>();

  useEffect(() => {
    const parent = rootRef.current?.parentElement;

    if (size !== "auto" || !parent) {
      return;
    }

    const updateAutoSize = () => {
      setAutoSize(parent.getBoundingClientRect().height || undefined);
    };

    updateAutoSize();

    const observer = new ResizeObserver(updateAutoSize);
    observer.observe(parent);

    return () => observer.disconnect();
  }, [size]);

  const rootStyle: CSSProperties & { "--icon-auto-size"?: string } = {
    ...(size === "auto" && autoSize
      ? { "--icon-auto-size": `${autoSize}px` }
      : {}),
    ...style,
    ...css.getPaddingStyles(props),
    ...css.getMarginStyles(props),
  };

  return (
    <Component
      ref={(element: HTMLElement | null) => {
        rootRef.current = element;
      }}
      className={[className, styles.Root].filter(Boolean).join(" ")}
      style={rootStyle}
      onClick={disabled || readOnly ? undefined : onClick}
      disabled={disabled}
      data-size={size}
      data-color={color}
      data-disabled={disabled || undefined}
      data-clickable={(onClick && !disabled && !readOnly) || undefined}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    >
      {children}

      {!!badge && <span className={styles.Badge}>{badge}</span>}
    </Component>
  );
}
