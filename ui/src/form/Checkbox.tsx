import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode, useId } from "react";
import { GiCheckMark } from "react-icons/gi";
import { Row } from "../layout/FlexBox";
import styles from "./Checkbox.module.scss";
import { useField } from "./Field";

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  label?: ReactNode;
};

export function Checkbox({
  className = "",
  id,
  label,
  ...props
}: CheckboxProps) {
  const fieldProps = useField(props);
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <Row alignY="center" className={styles.Checkbox}>
      <CheckboxPrimitive.Root
        className={[styles.Root, className].filter(Boolean).join(" ")}
        id={checkboxId}
        {...props}
        {...fieldProps}
      >
        <CheckboxPrimitive.Indicator className={styles.Indicator}>
          <GiCheckMark />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label className={styles.Label} htmlFor={checkboxId}>
          {label}
        </label>
      )}
    </Row>
  );
}
