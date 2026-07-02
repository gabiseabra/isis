import { omit } from "@isis/common/utils/object";
import { Slot } from "radix-ui";
import { ComponentProps, CSSProperties } from "react";
import * as css from "../utils/css";
import styles from "./FlexBox.module.scss";

export type RowProps = {
  as?: "div" | "section" | "header" | "footer" | "main";
  asChild?: boolean;
  flex?: number | string;
  gap?: number;
  wrap?: boolean;
  alignX?: CSSProperties["justifyContent"];
  alignY?: CSSProperties["alignItems"];
  width?: "wide" | "narrow" | "auto" | number | string;
  height?: number | string;
} & css.PaddingProps &
  css.MarginProps &
  ComponentProps<"div">;

export function Row({
  as: Component = "div",
  asChild,
  style = {},
  flex,
  gap,
  wrap,
  alignX,
  alignY,
  width,
  height,
  className = "",
  ...props
}: RowProps) {
  const isWidthKeyword =
    width === "wide" || width === "narrow" || width === "auto";
  const Root = asChild ? Slot.Root : Component;

  return (
    <Root
      className={[styles.FlexBox, className].filter(Boolean).join(" ")}
      data-direction="row"
      data-width={isWidthKeyword ? width : undefined}
      style={{
        flex,
        alignItems: alignY,
        justifyContent: alignX,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
        flexWrap: wrap ? "wrap" : undefined,
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

export type ColProps = {
  as?: "div" | "section" | "header" | "footer" | "main";
  asChild?: boolean;
  flex?: number | string;
  alignX?: CSSProperties["alignItems"];
  alignY?: CSSProperties["justifyContent"];
  width?: "wide" | "narrow" | "auto" | number | string;
  height?: number | string;
  gap?: number;
} & css.PaddingProps &
  css.MarginProps &
  ComponentProps<"div">;

export function Col({
  as: Component = "div",
  asChild,
  flex,
  gap,
  alignX,
  alignY,
  width,
  height,
  className = "",
  style = {},
  ...props
}: ColProps) {
  const isWidthKeyword =
    width === "wide" || width === "narrow" || width === "auto";
  const Root = asChild ? Slot.Root : Component;

  return (
    <Root
      className={[styles.FlexBox, className].filter(Boolean).join(" ")}
      data-direction="column"
      data-width={isWidthKeyword ? width : undefined}
      style={{
        flex,
        alignItems: alignX,
        justifyContent: alignY,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
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
