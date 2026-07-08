import styles from "./Card.module.scss";
import { FlexBox, FlexBoxProps } from "./FlexBox";

export type CardProps = FlexBoxProps & {
  elevation?: 0 | 1 | 2;
};

export function Card({ className, elevation = 0, ...props }: CardProps) {
  return (
    <FlexBox
      className={[styles.Card, className].filter(Boolean).join(" ")}
      data-elevation={elevation}
      {...props}
    />
  );
}
