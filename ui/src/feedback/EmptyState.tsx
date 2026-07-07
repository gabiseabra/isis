import { ReactNode } from "react";
import { BiSearch } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, ColProps, Row } from "../layout/FlexBox";
import { Color } from "../utils/css";

export type EmptyStateProps = ColProps & {
  color?: Color | "muted";
  size: "s" | "m" | "l" | "xl";
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
  const TitleWrapper = size === "s" ? Row : Col;
  return (
    <Col alignX="center" gap={2} p={2} {...props}>
      <TitleWrapper alignY="center">
        {icon && (
          <IconControl
            as="div"
            color={color}
            size="auto"
            style={{
              height: {
                s: 16,
                m: 32,
                l: 86,
                xl: 64,
              }[size],
            }}
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
      </TitleWrapper>

      {children}
    </Col>
  );
}
