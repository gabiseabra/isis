import { omit } from "@isis/common/utils/object";
import { type ComponentProps, type ReactNode } from "react";
import * as css from "../utils/css";
import { Field } from "./Field";
import styles from "./Input.module.scss";
import { BaseInputProps } from "./use-form";

export type InputProps = Omit<ComponentProps<"input">, "size"> &
  Partial<BaseInputProps<string>> & {
    size?: "s" | "m" | "l";
    variant?: "default" | "unstyled";
    left?: ReactNode;
    right?: ReactNode;
    onChangeValue?: (value: string) => void;
  } & css.PaddingProps &
  css.MarginProps;

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
  ...props
}: InputProps) {
  return (
    <Field htmlFor={props.id} {...{ label, description, error, required }}>
      <span
        className={styles.InputWrapper}
        data-size={size}
        data-variant={variant}
        style={{
          ...css.getPaddingStyles(props),
          ...css.getMarginStyles(props),
        }}
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
          {...omit(props, [...css.paddingProps, ...css.marginProps])}
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
