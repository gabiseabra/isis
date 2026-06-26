import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode } from "react";
import { GiCheckMark } from "react-icons/gi";
import { Row } from "../layout/FlexBox";
import styles from "./Checkbox.module.scss";
import { useField } from "./Field";

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  label?: ReactNode;
};

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  const field = useField();

  return (
    <Row alignY="center" className={styles.Checkbox}>
      <CheckboxPrimitive.Root
        className={[styles.Root, className].filter(Boolean).join(" ")}
        id={field.id}
        required={field.required}
        data-touched={field.isTouched || undefined}
        {...props}
        onBlur={(e) => {
          props.onBlur?.(e);
          field.setTouched();
        }}
      >
        <CheckboxPrimitive.Indicator className={styles.Indicator}>
          <GiCheckMark />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label className={styles.Label} htmlFor={fieldProps.id ?? props.id}>
          {label}
        </label>
      )}
    </Row>
  );
}
