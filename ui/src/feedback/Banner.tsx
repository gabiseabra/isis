import { type ReactNode } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, Row, type RowProps } from "../layout/FlexBox";
import styles from "./Banner.module.scss";

export type BannerType = "error" | "success" | "warning" | "info" | "neutral";

export type BannerProps = Omit<RowProps, "title"> & {
  type: BannerType;
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
};

export function Banner({
  type,
  title,
  children,
  icon,
  action,
  className = "",
  ...props
}: BannerProps) {
  return (
    <Row
      className={[styles.Banner, styles[`type-${type}`], className]
        .filter(Boolean)
        .join(" ")}
      alignY="start"
      {...props}
    >
      {(type !== "neutral" || icon) && (
        <IconControl as="span" size="s" color="currentColor" my={1}>
          {icon ??
            {
              success: <FaCheckCircle />,
              warning: <FaExclamationTriangle />,
              error: <FaExclamationCircle />,
              info: <FaInfoCircle />,
              neutral: null,
            }[type]}
        </IconControl>
      )}

      <Col className={styles.Content} my={1}>
        {title && (
          <Text
            as="h3"
            size="body"
            color="currentColor"
            className={styles.Title}
            m={0}
          >
            {title}
          </Text>
        )}

        <div className={styles.Body}>{children}</div>
      </Col>

      {action}
    </Row>
  );
}
