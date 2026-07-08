import { omit } from "@isis/common/utils/object";
import { CSSProperties } from "react";
import * as css from "../utils/css";
import { Box, BoxProps } from "./Box";
import styles from "./FlexBox.module.scss";

export type RowProps = BoxProps & {
  flex?: number | string | boolean;
  gap?: number;
  wrap?: boolean;
  alignX?: CSSProperties["justifyContent"];
  alignY?: CSSProperties["alignItems"];
};

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
  if (!flex) return <Box className={className} style={style} {...props} />;
  return (
    <Box
      className={[styles.FlexBox, className].filter(Boolean).join(" ")}
      data-direction="row"
      style={{
        flex: flex === true ? undefined : flex,
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
  flex?: number | string | boolean;
  gap?: number;
  alignX?: CSSProperties["alignItems"];
  alignY?: CSSProperties["justifyContent"];
} & BoxProps;

export function Col({
  flex,
  gap,
  alignX,
  alignY,
  className,
  style,
  ...props
}: ColProps) {
  if (!flex) return <Box className={className} style={style} {...props} />;
  return (
    <Box
      className={[styles.FlexBox, className].filter(Boolean).join(" ")}
      data-direction="column"
      style={{
        flex: flex === true ? undefined : flex,
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
      direction?: "block";
    } & ColProps);

export function FlexBox(props: FlexBoxProps) {
  return props.direction === "inline" ? (
    <Row {...omit(props, ["direction"])} />
  ) : (
    <Col {...omit(props, ["direction"])} />
  );
}
