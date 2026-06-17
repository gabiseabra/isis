import { Dialog } from "radix-ui";
import { type ReactNode } from "react";
import { BiX } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, Row } from "../layout/FlexBox";
import styles from "./Modal.module.scss";
import { useOverlay } from "./OverlayProvider";

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
                <Text as="h2" size="h4" m={0}>
                  {title}
                </Text>
              </Dialog.Title>

              <Dialog.Close
                className={styles.Close}
                aria-label="Fechar"
                asChild
              >
                <IconControl
                  as="button"
                  color="muted"
                  size="m"
                  style={{ cursor: "pointer" }}
                >
                  <BiX />
                </IconControl>
              </Dialog.Close>
            </Row>

            {description ? (
              <Dialog.Description asChild>
                <Text as="h5" color="muted" m={0}>
                  {description}
                </Text>
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
