import { Popover as PopoverPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode } from "react";
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
};

export function Popover({
  children,
  content,
  open,
  onOpenChange,
  variant = "solid",
  className,
  ...props
}: PopoverProps) {
  const overlay = useOverlay();
  const boundary = useBoundary(Popover.Boundary);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={overlay.root}>
        <PopoverPrimitive.Content
          className={[styles.Content, className].filter(Boolean).join(" ")}
          data-variant={variant}
          collisionPadding={boundary.paddingPx}
          collisionBoundary={boundary.element}
          {...props}
        >
          <div className={styles.Body}>{content}</div>
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
