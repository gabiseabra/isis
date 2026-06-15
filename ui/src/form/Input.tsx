import { type ComponentProps, type ReactNode } from "react";
import { useField } from "./Field";
import styles from "./Input.module.scss";

export type InputProps = ComponentProps<"input"> & {
  left?: ReactNode;
  right?: ReactNode;
};

export function Input({ className = "", left, right, ...props }: InputProps) {
  const fieldProps = useField(props);

  return (
    <span className={styles.InputWrapper}>
      {!!left && (
        <span className={[styles.Slot, styles.LeftSlot].join(" ")}>{left}</span>
      )}
      <input
        className={[styles.Input, className].filter(Boolean).join(" ")}
        {...props}
        {...fieldProps}
      />
      {!!right && (
        <span className={[styles.Slot, styles.RightSlot].join(" ")}>
          {right}
        </span>
      )}
    </span>
  );
}
