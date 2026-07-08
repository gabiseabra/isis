import { type ComponentProps, type ReactNode } from "react";
import { Field, FieldProps } from "./Field";
import { InputWrapper } from "./InputWrapper";
import { BaseInputProps } from "./use-form";

export type InputProps = Omit<ComponentProps<"input">, "size"> &
  BaseInputProps<string> & {
    size?: "s" | "m" | "l";
    variant?: "default" | "unstyled";
    left?: ReactNode;
    right?: ReactNode;
    fieldProps?: FieldProps;
  };

export function Input({
  size = "m",
  variant = "default",
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
      {...{ label, description, error, required }}
      {...fieldProps}
    >
      <InputWrapper
        size={size}
        variant={variant}
        disabled={props.disabled}
        left={left}
        right={right}
      >
        <input
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
      </InputWrapper>
    </Field>
  );
}
