import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { type ComponentProps } from "react";
import { GiCheckMark } from "react-icons/gi";
import { Row } from "../layout/FlexBox";
import styles from "./Checkbox.module.scss";
import { Field } from "./Field";
import { BaseInputProps } from "./use-form";

export type CheckboxProps = Omit<
  ComponentProps<typeof CheckboxPrimitive.Root>,
  "value"
> &
  BaseInputProps<boolean>;

export function Checkbox({
  className,
  value,
  onChangeValue,
  touched,
  onTouch,
  required,
  label,
  description,
  error,
  ...props
}: CheckboxProps) {
  return (
    <Field {...{ description, error }}>
      <Row alignY="center" className={styles.Checkbox}>
        <CheckboxPrimitive.Root
          checked={value}
          onCheckedChange={onChangeValue}
          className={[styles.Root, className].filter(Boolean).join(" ")}
          data-touched={touched || undefined}
          required={required}
          {...props}
          onBlur={(e) => {
            props.onBlur?.(e);
            onTouch?.();
          }}
        >
          <CheckboxPrimitive.Indicator className={styles.Indicator}>
            <GiCheckMark />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label className={styles.Label} htmlFor={props.id}>
            {label}
          </label>
        )}
      </Row>
    </Field>
  );
}
