import { ReactNode } from "react";
import { BiSearch } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, ColProps } from "../layout/FlexBox";
import { Color } from "../utils/css";

export type EmptyStateProps = ColProps & {
  color?: Color | "muted";
  size: "m" | "l";
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
};

export function EmptyState({
  color = "muted",
  size,
  icon = <BiSearch />,
  title,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <Col alignX="center" gap={2} {...props}>
      {icon && (
        <IconControl
          as="div"
          mb={1}
          color={color}
          size="auto"
          height={
            {
              m: 64,
              l: 86,
            }[size]
          }
        >
          {icon}
        </IconControl>
      )}

      <Text
        as="div"
        size={size === "l" ? "h4" : "body"}
        font="sans-serif"
        color={color}
      >
        {title}
      </Text>

      {children}
    </Col>
  );
}
