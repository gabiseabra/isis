import { Box, BoxProps } from "./Box";
import styles from "./Card.module.scss";

export type CardProps = BoxProps & {
  elevation?: 0 | 1 | 2;
};

export function Card({ className, elevation = 0, ...props }: CardProps) {
  return (
    <Box
      className={[styles.Card, className].filter(Boolean).join(" ")}
      data-elevation={elevation}
      {...props}
    />
  );
}
