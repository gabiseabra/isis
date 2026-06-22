import { omit } from "@isis/common/utils/object";
import { Slot } from "radix-ui";
import { HTMLAttributes, PointerEvent, useRef, useState } from "react";
import { Divider } from "../display/Divider";
import styles from "./Resizable.module.scss";

export type ResizableProps = HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  aspectRatio?: number;
  disabled?: boolean;
} & (
    | {
        direction: "both";
        onResize?: (
          size: { height: number; width: number },
          event: PointerEvent<HTMLDivElement>,
        ) => void;
      }
    | {
        direction: "x" | "y";
        onResize?: (size: number, event: PointerEvent<HTMLDivElement>) => void;
      }
  );

export function Resizable({
  asChild,
  aspectRatio,
  children,
  className,
  style,
  disabled,
  ...props
}: ResizableProps) {
  const dragRef = useRef<{
    height: number;
    pointerX: number;
    pointerY: number;
    sign: 1 | -1;
    width: number;
  }>(null);
  const [size, setSize] = useState<{ height?: number; width?: number }>({});
  const [resizing, setResizing] = useState(false);

  const stopResize = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    setResizing(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handle = (
    <div
      className={styles.Handle}
      onPointerCancel={stopResize}
      onPointerDown={(event) => {
        if (disabled) return;

        const element = event.currentTarget.parentElement;

        if (!element) return;

        const box = element.getBoundingClientRect();

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
          height: box.height,
          pointerX: event.clientX,
          pointerY: event.clientY,
          sign:
            props.direction === "x" &&
            getComputedStyle(element).direction === "rtl"
              ? -1
              : 1,
          width: box.width,
        };
        setResizing(true);
      }}
      onPointerMove={(event) => {
        if (!dragRef.current) return;

        const deltaX =
          dragRef.current.sign * (event.clientX - dragRef.current.pointerX);
        const deltaY = event.clientY - dragRef.current.pointerY;
        const rawHeight = Math.max(40, dragRef.current.height + deltaY);
        const rawWidth = Math.max(40, dragRef.current.width + deltaX);
        const nextWidth =
          props.direction === "y" && aspectRatio
            ? rawHeight * aspectRatio
            : rawWidth;
        const nextHeight =
          props.direction !== "y" && aspectRatio
            ? nextWidth / aspectRatio
            : rawHeight;
        const nextSize = {
          height:
            props.direction === "x" && !aspectRatio ? undefined : nextHeight,
          width:
            props.direction === "y" && !aspectRatio ? undefined : nextWidth,
        };

        setSize(nextSize);
        if (props.direction === "both") {
          props.onResize?.({ height: nextHeight, width: nextWidth }, event);
        } else {
          props.onResize?.(
            props.direction === "x" ? nextWidth : nextHeight,
            event,
          );
        }
      }}
      onPointerUp={stopResize}
    >
      {!disabled &&
        (props.direction === "both" ? (
          <Divider direction="both" m={1} />
        ) : (
          <Divider
            direction={props.direction === "y" ? "x" : "y"}
            mx={props.direction === "y" ? 1 : 0}
            my={props.direction === "x" ? 1 : 0}
          />
        ))}
    </div>
  );

  const rootProps = {
    className: [styles.Resizable, className].filter(Boolean).join(" "),
    "data-direction": props.direction,
    "data-resizing": resizing || undefined,
    style: {
      ...style,
      height: size.height ?? style?.height,
      width: size.width ?? style?.width,
    },
    ...omit(props, ["direction", "onResize"]),
  };

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
