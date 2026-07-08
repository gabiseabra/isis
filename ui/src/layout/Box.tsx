import { omit } from "@isis/common/utils/object";
import { Slot } from "radix-ui";
import { HTMLAttributes, Ref } from "react";
import * as css from "../utils/css";
import styles from "./Box.module.scss";

export type BoxProps = {
  ref?: Ref<HTMLElement>;
  asChild?: boolean;
  flex?: number | string;
  width?: "wide" | "narrow" | "auto" | number | string;
  height?: number | string;
} & css.PaddingProps &
  css.MarginProps &
  HTMLAttributes<HTMLElement>;

export function Box({
  ref,
  asChild,
  style,
  flex,
  width,
  height,
  className = "",
  ...props
}: BoxProps) {
  const isWidthKeyword =
    width === "wide" || width === "narrow" || width === "auto";
  const Root = asChild ? Slot.Root : "div";

  return (
    <Root
      ref={(element) => {
        if (ref instanceof Function) ref(element);
        else if (ref) ref.current = element;
      }}
      className={[styles.Box, className].filter(Boolean).join(" ")}
      data-direction="row"
      data-width={isWidthKeyword ? width : undefined}
      style={{
        flex,
        width: !isWidthKeyword ? width : undefined,
        height,
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
        ...style,
      }}
      {...omit(props, [...css.paddingProps, ...css.marginProps])}
    />
  );
}
