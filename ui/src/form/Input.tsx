import { type ComponentProps, type ReactNode } from "react";
import { Field } from "./Field";
import styles from "./Input.module.scss";
import { BaseInputProps } from "./use-form";

export type InputProps = Omit<ComponentProps<"input">, "size"> &
  Partial<BaseInputProps<string>> & {
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
  required,
  touched,
  onTouch,
  label,
  description,
  error,
  ...props
}: InputProps) {
  return (
    <Field htmlFor={props.id} {...{ label, description, error, required }}>
      <span className={styles.InputWrapper} data-size={size}>
        {!!left && (
          <span className={[styles.Slot, styles.LeftSlot].join(" ")}>
            {left}
          </span>
        )}
        <input
          className={[styles.Input, className].filter(Boolean).join(" ")}
          required={required}
          data-touched={touched || undefined}
          autoComplete="off"
          {...props}
          onChange={(e) => {
            props.onChange?.(e);
            props.onChangeValue?.(e.target.value);
          }}
          onBlur={(e) => {
            props.onBlur?.(e);
            onTouch?.();
          }}
        />
        {!!right && (
          <span className={[styles.Slot, styles.RightSlot].join(" ")}>
            {right}
          </span>
        )}
      </span>
    </Field>
  );
}
