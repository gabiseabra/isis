import { omit } from "@isis/common/utils/object";
import { type ComponentProps, useEffect, useRef } from "react";
import * as css from "../utils/css";
import { Field } from "./Field";
import styles from "./Textarea.module.scss";
import { BaseInputProps } from "./use-form";

export type TextareaProps = ComponentProps<"textarea"> &
  BaseInputProps<string> & {
    autoGrow?: boolean;
    variant?: "default" | "unstyled";
  } & css.PaddingProps &
  css.MarginProps;

export function Textarea({
  ref,
  autoGrow = false,
  variant = "default",
  className = "",
  onInput,
  rows,
  value,
  onChangeValue,
  required,
  touched,
  onTouch,
  label,
  description,
  error,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoGrow && textareaRef.current) {
      fitTextarea(textareaRef.current);
    }
  }, [autoGrow]);

  return (
    <Field htmlFor={props.id} {...{ label, description, error, required }}>
      <textarea
        required={required}
        data-touched={touched || undefined}
        data-variant={variant}
        {...omit(props, [...css.paddingProps, ...css.marginProps])}
        ref={(element) => {
          textareaRef.current = element;
          if (ref instanceof Function) ref(element);
          else if (ref) ref.current = element;
        }}
        rows={rows}
        value={value}
        style={{
          ...css.getPaddingStyles(props),
          ...css.getMarginStyles(props),
          ...props.style,
        }}
        className={[styles.Textarea, autoGrow && styles.autogrow, className]
          .filter(Boolean)
          .join(" ")}
        onChange={(e) => {
          props.onChange?.(e);
          onChangeValue?.(e.currentTarget.value);
        }}
        onInput={(e) => {
          if (autoGrow) {
            fitTextarea(e.currentTarget);
          }

          onInput?.(e);
        }}
        onBlur={(e) => {
          props.onBlur?.(e);
          onTouch?.();
        }}
      />
    </Field>
  );
}

function fitTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}
