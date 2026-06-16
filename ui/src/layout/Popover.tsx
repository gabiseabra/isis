import { Popover as PopoverPrimitive, Slot } from "radix-ui";
import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from "react";
import { useOverlay } from "../context/OverlayProvider";
import styles from "./Popover.module.scss";

const PopoverBoundaryContext = createContext<HTMLElement | null>(null);

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
  const collisionBoundary = useContext(PopoverBoundaryContext);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={overlay.root}>
        <PopoverPrimitive.Content
          className={[styles.Content, className].filter(Boolean).join(" ")}
          data-variant={variant}
          collisionBoundary={collisionBoundary}
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

type PopoverBoundaryProps = Omit<ComponentProps<"div">, "ref"> & {
  asChild?: boolean;
  ref?: Ref<HTMLElement>;
};

Popover.Boundary = function PopoverBoundary({
  asChild,
  ref,
  ...props
}: PopoverBoundaryProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const boundaryRef = (element: HTMLElement | null) => {
    setElement(element);
    if (ref instanceof Function) ref(element);
    else if (ref) ref.current = element;
  };

  return (
    <PopoverBoundaryContext.Provider value={element}>
      {asChild ? (
        <Slot.Root ref={boundaryRef} {...props} />
      ) : (
        <div ref={boundaryRef} {...props} />
      )}
    </PopoverBoundaryContext.Provider>
  );
};
