import { Box, BoxProps } from "../layout/Box";
import { createBoundary } from "./Boundary";
import styles from "./Overlay.module.scss";

export type OverlayProps = BoxProps & {
  open?: boolean;
};

export function Overlay({ open, className, ...props }: OverlayProps) {
  return (
    <Box
      className={[styles.Overlay, className].filter(Boolean).join(" ")}
      data-open={open || undefined}
      {...props}
    />
  );
}

Overlay.Backdrop = function OverlayBackdrop(props: {
  variant: "dark" | "light";
}) {
  return <div className={styles.Backdrop} data-variant={props.variant} />;
};

Overlay.Boundary = createBoundary((props) => ({
  ...props,
  className: [styles.Boundary, props.className].filter(Boolean).join(" "),
}));
