import { ComponentProps } from "react";
import styles from "./Spinner.module.scss";

export type SpinnerProps = {
  size: "s" | "m" | "l";
} & Omit<ComponentProps<"div">, "children">;

export function Spinner({ size, className, ...props }: SpinnerProps) {
  return (
    <div
      className={[className, styles.spinner, styles[`size-${size}`]]
        .filter(Boolean)
        .join(" ")}
      role="status"
      {...props}
    />
  );
}
