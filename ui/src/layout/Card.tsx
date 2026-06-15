import styles from "./Card.module.scss";
import { Col, ColProps } from "./FlexBox";

export type CardProps = ColProps & {
  elevation?: 0 | 1 | 2;
};

export function Card({ className, elevation = 0, ...props }: CardProps) {
  return (
    <Col
      className={[styles.Card, styles[`elevation-${elevation}`], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
