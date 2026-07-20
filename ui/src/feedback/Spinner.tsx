import { ComponentProps } from "react";
import { Color } from "../utils/css";
import styles from "./Spinner.module.scss";

export type SpinnerProps = {
  size: "s" | "m" | "l";
  color?: Color;
} & Omit<ComponentProps<"div">, "children">;

export function Spinner({ size, color, className, ...props }: SpinnerProps) {
  return (
    <div
      className={[styles.Spinner, className].filter(Boolean).join(" ")}
      data-size={size}
      data-color={color}
      role="status"
      {...props}
    />
  );
}
