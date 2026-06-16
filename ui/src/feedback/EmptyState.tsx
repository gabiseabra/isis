import { ReactNode } from "react";
import { BiSearch } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, Row } from "../layout/FlexBox";
import { Color } from "../utils/css";

type EmptyStateProps = {
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
}: EmptyStateProps) {
  return (
    <Col alignX="center" gap={2}>
      {icon && (
        <IconControl
          as="div"
          mb={1}
          color={color}
          size={
            (
              {
                m: "l",
                l: "xl",
              } as const
            )[size]
          }
        >
          {icon}
        </IconControl>
      )}

      <Text
        as="div"
        size={size === "l" ? "h4" : "body"}
        font="heading"
        color={color}
      >
        {title}
      </Text>

      {children}
    </Col>
  );
}
