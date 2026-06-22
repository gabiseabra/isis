import { omit } from "@isis/common/utils/object";
import { HTMLAttributes } from "react";
import * as css from "../utils/css";
import styles from "./Divider.module.scss";

type DividerProps = {
  direction: "x" | "y" | "both";
} & Omit<HTMLAttributes<HTMLElement>, "children"> &
  css.MarginProps &
  css.PaddingProps;

export function Divider({
  direction,
  className = "",
  style,
  ...props
}: DividerProps) {
  return (
    <div
      className={[styles.Divider, className].join(" ")}
      data-direction={direction}
      style={{
        ...css.getMarginStyles(props),
        ...css.getPaddingStyles(props),
        ...style,
      }}
      {...omit(props, [...css.marginProps, ...css.paddingProps])}
    >
      {direction === "both" && (
        <>
          <div data-side="x" />
          <div data-side="y" />
          <div data-corner />
        </>
      )}
    </div>
  );
}
