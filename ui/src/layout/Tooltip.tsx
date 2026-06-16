import { useRef, useState } from "react";
import { Popover, PopoverProps } from "./Popover";

export type TooltipProps = Omit<PopoverProps, "open" | "onOpenChange"> & {
  delay?: number;
};

export function Tooltip({ children, delay = 300, ...props }: TooltipProps) {
  const [open, setOpen] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const onOpen = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, delay);
  };

  const onClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = null;
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="top"
      variant="sheer"
      {...props}
    >
      <span
        onPointerEnter={onOpen}
        onPointerLeave={onClose}
        onTouchStart={onOpen}
        onTouchEnd={onClose}
        onTouchCancel={onClose}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          touchAction: "manipulation",
        }}
      >
        {children}
      </span>
    </Popover>
  );
}
