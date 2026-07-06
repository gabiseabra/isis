import { ReactNode } from "react";
import { Row, RowProps } from "../layout/FlexBox";
import styles from "./InputWrapper.module.scss";

export type InputWrapperProps = RowProps & {
  size?: "s" | "m" | "l";
  disabled?: boolean;
  active?: boolean;
  empty?: boolean;
  variant?: "default" | "unstyled";
  right?: ReactNode;
  left?: ReactNode;
};

export function InputWrapper({
  size = "m",
  variant,
  gap,
  alignY = "center",
  active,
  empty,
  disabled,
  right,
  left,
  children,
  className,
  ...props
}: InputWrapperProps) {
  return (
    <Row
      className={[styles.InputWrapper, className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      data-size={size}
      data-variant={variant}
      data-active={active || undefined}
      data-empty={empty}
      {...props}
    >
      {left && (
        <Row
          gap={gap}
          alignY={alignY}
          className={[styles.Slot, styles.LeftSlot].join(" ")}
        >
          {left}
        </Row>
      )}

      <Row gap={gap} alignY={alignY} className={styles.Content}>
        {children}
      </Row>

      {right && (
        <Row
          gap={gap}
          alignY={alignY}
          className={[styles.Slot, styles.RightSlot].join(" ")}
        >
          {right}
        </Row>
      )}
    </Row>
  );
}
