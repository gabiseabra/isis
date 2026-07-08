import { Dialog } from "radix-ui";
import { type ReactNode } from "react";
import { BiX } from "react-icons/bi";
import { IconButton } from "../display/IconButton";
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
          <Col asChild className={styles.Header}>
            <header>
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
                  <IconButton>
                    <IconControl color="muted" size="m">
                      <BiX />
                    </IconControl>
                  </IconButton>
                </Dialog.Close>
              </Row>

              {description ? (
                <Dialog.Description asChild>
                  <Text as="h5" color="muted" m={0}>
                    {description}
                  </Text>
                </Dialog.Description>
              ) : null}
            </header>
          </Col>

          <Col className={styles.Body}>{children}</Col>

          {footer && (
            <Row asChild alignX="end" className={styles.Footer}>
              <footer>{footer}</footer>
            </Row>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
