import { Dialog } from "radix-ui";
import { type ReactNode } from "react";
import { FaXmark } from "react-icons/fa6";
import { useOverlay } from "../context/OverlayProvider";
import { IconControl } from "../display/IconControl";
import { Col, Row } from "../layout/FlexBox";
import styles from "./Modal.module.scss";

export function Modal({
  open,
  title,
  description,
  footer,
  children,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const overlay = useOverlay();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Dialog.Portal container={overlay.root}>
        <Dialog.Overlay className={styles.Overlay} />
        <Dialog.Content className={styles.Content}>
          <Col as="header" className={styles.Header}>
            <Row alignX="space-between" alignY="center">
              <Dialog.Title asChild>
                <span className={styles.Title}>{title}</span>
              </Dialog.Title>

              <Dialog.Close
                className={styles.Close}
                aria-label="Fechar"
                asChild
              >
                <IconControl as="button" size="s" style={{ cursor: "pointer" }}>
                  <FaXmark />
                </IconControl>
              </Dialog.Close>
            </Row>

            {description ? (
              <Dialog.Description className={styles.Description}>
                {description}
              </Dialog.Description>
            ) : null}
          </Col>

          <Col className={styles.Body}>{children}</Col>

          {footer && (
            <Row as="footer" alignX="end" className={styles.Footer}>
              {footer}
            </Row>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
