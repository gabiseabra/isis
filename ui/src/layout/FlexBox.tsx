import { omit } from "@isis/common/utils/object";
import { ComponentProps, CSSProperties } from "react";
import * as css from "../utils/css";
import { Box, BoxProps } from "./Box";
import styles from "./FlexBox.module.scss";

export type RowProps = {
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
  flex,
  gap,
  wrap,
  alignX,
  alignY,
  className,
  style,
  ...props
}: RowProps) {
  return (
    <Box
      className={[styles.FlexBox, className].filter(Boolean).join(" ")}
      data-direction="row"
      style={{
        flex,
        alignItems: alignY,
        justifyContent: alignX,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

export type ColProps = {
  asChild?: boolean;
  alignX?: CSSProperties["alignItems"];
  alignY?: CSSProperties["justifyContent"];
  gap?: number;
} & BoxProps;

export function Col({
  gap,
  alignX,
  alignY,
  className,
  style,
  ...props
}: ColProps) {
  return (
    <Box
      className={[styles.FlexBox, className].filter(Boolean).join(" ")}
      data-direction="column"
      style={{
        alignItems: alignX,
        justifyContent: alignY,
        gap: typeof gap === "number" ? css.space(gap) : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

export type FlexBoxProps =
  | ({
      direction: "inline";
    } & RowProps)
  | ({
      direction: "block";
    } & ColProps);

export function FlexBox(props: FlexBoxProps) {
  return props.direction === "inline" ? (
    <Row {...omit(props, ["direction"])} />
  ) : (
    <Col {...omit(props, ["direction"])} />
  );
}
