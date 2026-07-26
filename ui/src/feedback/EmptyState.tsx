import { ReactNode } from "react";
import { BiError } from "react-icons/bi";
import { LuFileSearch, LuSearch } from "react-icons/lu";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, ColProps, Row } from "../layout/FlexBox";
import { Color } from "../utils/css";

export type EmptyStateProps = Omit<ColProps, "title"> & {
  color?: Color;
  size?: "s" | "m";
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
};

export function EmptyState({
  color,
  size = "m",
  icon,
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
            color={color}
            size="auto"
            style={{
              height: {
                s: 16,
                m: 48,
              }[size],
            }}
          >
            {icon}
          </IconControl>
        )}

        <Text
          size={({ s: "body", m: "h4" } as const)[size]}
          font="sans-serif"
          color={color}
        >
          {title}
        </Text>
      </TitleWrapper>

      {!!children && (
        <Text size="caption" color="muted">
          {children}
        </Text>
      )}
    </Col>
  );
}

export function EmptySearch(props: Omit<EmptyStateProps, "icon">) {
  return (
    <EmptyState
      icon={props.size === "s" ? <LuSearch /> : <LuFileSearch />}
      color="muted"
      {...props}
    />
  );
}

export function ErrorState(props: Omit<EmptyStateProps, "icon">) {
  return <EmptyState icon={<BiError />} color="red" {...props} />;
}
