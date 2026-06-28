import * as css from "../utils/css";
import { Col, ColProps, Row } from "./FlexBox";
import styles from "./Skeleton.module.scss";

export type SkeletonProps = ColProps & {
  radius?: number;
};

export function Skeleton({
  radius = 0.5,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <Col
      className={[styles.Skeleton, className].filter(Boolean).join(" ")}
      style={{
        borderRadius: css.radius(radius),
        ...style,
      }}
      {...props}
    />
  );
}

Skeleton.Box = function SkeletonBox(props: SkeletonProps) {
  return <Skeleton height="auto" width="100%" radius={0} {...props} />;
};

Skeleton.Text = function SkeletonText({
  rows,
  width,
  radius,
  style,
  ...props
}: Omit<SkeletonProps, "height"> & {
  rows: number;
}) {
  return (
    <Col
      gap={0}
      style={{
        width,
        ...style,
      }}
      {...props}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <Row key={i} alignY="center" style={{ height: `var(--line-height)` }}>
          <Skeleton flex={1} height={8} radius={radius} />
        </Row>
      ))}
    </Col>
  );
};
