import { ReactNode } from "react";
import { BiSearch } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, Row } from "../layout/FlexBox";

type EmptyStateProps = {
  size: "m" | "l";
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
};

export function EmptyState({
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
          color="muted"
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
        color="muted"
      >
        {title}
      </Text>

      {children}
    </Col>
  );
}
