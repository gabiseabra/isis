import { type ComponentProps, type ReactNode } from "react";
import { useField } from "./Field";
import styles from "./Input.module.scss";

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: "s" | "m" | "l";
  left?: ReactNode;
  right?: ReactNode;
  onChangeValue?: (value: string) => void;
};

export function Input({
  size = "m",
  className = "",
  left,
  right,
  ...props
}: InputProps) {
  const field = useField();

  return (
    <span className={styles.InputWrapper} data-size={size}>
      {!!left && (
        <span className={[styles.Slot, styles.LeftSlot].join(" ")}>{left}</span>
      )}
      <input
        className={[styles.Input, className].filter(Boolean).join(" ")}
        id={field.id}
        required={field.required}
        data-touched={field.isTouched || undefined}
        autoComplete="off"
        {...props}
        onChange={(e) => {
          props.onChange?.(e);
          props.onChangeValue?.(e.target.value);
        }}
        onBlur={(e) => {
          props.onBlur?.(e);
          field.setTouched();
        }}
      />
      {!!right && (
        <span className={[styles.Slot, styles.RightSlot].join(" ")}>
          {right}
        </span>
      )}
    </span>
  );
}
