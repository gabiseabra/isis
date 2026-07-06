import { type ComponentProps, type ReactNode } from "react";
import { Field, FieldProps } from "./Field";
import styles from "./Input.module.scss";
import { BaseInputProps } from "./use-form";

export type InputProps = Omit<ComponentProps<"input">, "size"> &
  Partial<BaseInputProps<string>> & {
    size?: "s" | "m" | "l";
    variant?: "default" | "unstyled";
    left?: ReactNode;
    right?: ReactNode;
    onChangeValue?: (value: string) => void;
    fieldProps?: Partial<FieldProps>;
  };

export function Input({
  size = "m",
  variant = "default",
  className = "",
  left,
  right,
  required,
  touched,
  onTouch,
  label,
  description,
  error,
  fieldProps,
  ...props
}: InputProps) {
  return (
    <Field
      htmlFor={props.id}
      direction={variant === "unstyled" ? "inline" : "block"}
      alignY="center"
      {...{ label, description, error, required }}
      {...fieldProps}
    >
      <span
        className={styles.InputWrapper}
        data-size={size}
        data-variant={variant}
      >
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
