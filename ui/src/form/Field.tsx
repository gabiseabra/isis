import { type ReactNode } from "react";
import { BiErrorCircle, BiInfoCircle } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { FlexBox, FlexBoxProps } from "../layout/FlexBox";
import { Tooltip } from "../overlay/Tooltip";
import styles from "./Field.module.scss";

export type FieldProps = FlexBoxProps & {
  htmlFor?: string;
  label?: ReactNode;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
};

export function Field({
  htmlFor,
  label,
  required,
  description,
  error,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <FlexBox
      {...props}
      className={[styles.Field, className].filter(Boolean).join(" ")}
    >
      {label && (
        <label className={styles.Label} htmlFor={htmlFor}>
          {label}
          {required && (
            <IconControl size="s" color="red">
              *
            </IconControl>
          )}
        </label>
      )}

      {children}

      {description &&
        {
          block: (
            <Text color="muted" size="caption">
              {description}
            </Text>
          ),
          inline: (
            <Tooltip content={description}>
              <IconControl size="s" color="blue">
                <BiInfoCircle />
              </IconControl>
            </Tooltip>
          ),
        }[props.direction ?? "block"]}

      {error &&
        {
          block: (
            <Text color="red" size="caption">
              {error}
            </Text>
          ),
          inline: (
            <Tooltip content={error}>
              <IconControl size="s" color="red">
                <BiErrorCircle />
              </IconControl>
            </Tooltip>
          ),
        }[props.direction ?? "block"]}
    </FlexBox>
  );
}
