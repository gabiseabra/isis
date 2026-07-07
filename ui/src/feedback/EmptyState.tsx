import { ReactNode } from "react";
import { BiSearch } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, ColProps, Row } from "../layout/FlexBox";
import { Color } from "../utils/css";

export type EmptyStateProps = ColProps & {
  color?: Color | "muted";
  size: "s" | "m" | "l";
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
                l: 64,
              }[size],
            }}
          >
            {icon}
          </IconControl>
        )}

        <Text
          as="div"
          size={({ s: "body", m: "body", l: "h4" } as const)[size]}
          font="sans-serif"
          color={color}
        >
          {title}
        </Text>
      </TitleWrapper>

      <Text
        as="div"
        size={({ s: "caption", m: "body", l: "body" } as const)[size]}
        color="muted"
      >
        {children}
      </Text>
    </Col>
  );
}
