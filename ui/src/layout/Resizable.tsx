import { Slot } from "radix-ui";
import {
  ComponentProps,
  DragEvent,
  HTMLAttributes,
  PointerEvent,
  useRef,
  useState,
} from "react";
import { Divider } from "../display/Divider";
import styles from "./Resizable.module.scss";

export type ResizableProps = HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  direction: "x" | "y";
  onResize?: (width: number, event: DragEvent<HTMLDivElement>) => void;
};

export function Resizable({
  asChild,
  children,
  className,
  direction,
  onResize,
  style,
  ...props
}: ResizableProps) {
  const drag = useRef<
    | {
        pointer: number;
        size: number;
        sign: 1 | -1;
      }
    | undefined
  >(undefined);
  const [size, setSize] = useState<number>();
  const [resizing, setResizing] = useState(false);

  const stopResize = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = undefined;
    setResizing(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const rootProps = {
    className: [styles.Resizable, className].filter(Boolean).join(" "),
    "data-direction": direction,
    "data-resizing": resizing || undefined,
    style: {
      ...style,
      height: direction === "y" ? (size ?? style?.height) : style?.height,
      width: direction === "x" ? (size ?? style?.width) : style?.width,
    },
    ...props,
  };

  const handle = (
    <div
      className={styles.Handle}
      onPointerCancel={stopResize}
      onPointerDown={(event) => {
        const element = event.currentTarget.parentElement;
        const box = element?.getBoundingClientRect();
        const isRtl = element && getComputedStyle(element).direction === "rtl";

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          pointer: direction === "x" ? event.clientX : event.clientY,
          sign: direction === "x" && isRtl ? -1 : 1,
          size: direction === "x" ? (box?.width ?? 0) : (box?.height ?? 0),
        };
        setResizing(true);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;

        const pointer = direction === "x" ? event.clientX : event.clientY;
        const nextSize = Math.max(
          40,
          drag.current.size +
            drag.current.sign * (pointer - drag.current.pointer),
        );

        setSize(nextSize);
        onResize?.(nextSize, event as unknown as DragEvent<HTMLDivElement>);
      }}
      onPointerUp={stopResize}
    >
      <Divider
        direction={direction === "x" ? "y" : "x"}
        mx={direction === "y" ? 1 : 0}
        my={direction === "x" ? 1 : 0}
      />
    </div>
  );

  if (asChild) {
    return (
      <Slot.Root {...rootProps}>
        <Slot.Slottable>{children}</Slot.Slottable>
        {handle}
      </Slot.Root>
    );
  }

  return (
    <div {...rootProps}>
      {children}
      {handle}
    </div>
  );
}
