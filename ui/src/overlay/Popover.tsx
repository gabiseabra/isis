import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import * as css from "../utils/css";
import { createBoundary, useBoundary } from "./Boundary";
import { useOverlay } from "./OverlayProvider";
import styles from "./Popover.module.scss";

export type PopoverProps = Omit<
  ComponentProps<typeof PopoverPrimitive.Content>,
  "content"
> & {
  children: ReactNode;
  content: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "solid" | "sheer";
  body?: ComponentProps<"div">;
};

export function Popover({
  children,
  content,
  open,
  onOpenChange,
  variant = "solid",
  sideOffset = 1,
  alignOffset,
  className,
  body,
  ref,
  ...props
}: PopoverProps) {
  const [contentElement, setContentElement] = useState<
    HTMLElement | undefined
  >();
  const overlay = useOverlay();
  const boundary = useBoundary(Popover.Boundary);

  const space = useMemo(
    () =>
      css.toPx(css.computeProperty(css._space, contentElement), contentElement),
    [contentElement],
  );

  if (sideOffset) sideOffset *= space;
  if (alignOffset) alignOffset *= space;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={overlay.root}>
        <PopoverPrimitive.Content
          ref={(element) => {
            if (ref instanceof Function) ref(element);
            else if (ref) ref.current = element;
            setContentElement(element ?? undefined);
          }}
          className={[styles.Content, className].filter(Boolean).join(" ")}
          data-variant={variant}
          collisionPadding={boundary.paddingPx}
          collisionBoundary={boundary.element}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          {...props}
        >
          <div
            {...body}
            className={[styles.Body, body?.className].filter(Boolean).join(" ")}
          >
            {content}
          </div>
          <PopoverPrimitive.Arrow
            className={styles.Arrow}
            height="var(--popover-tip-height)"
            width="var(--popover-tip-width)"
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

Popover.Boundary = createBoundary();
