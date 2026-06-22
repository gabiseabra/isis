import { omit } from "@isis/common/utils/object";
import { Slot } from "radix-ui";
import { HTMLAttributes, PointerEvent, useRef, useState } from "react";
import { Divider } from "../display/Divider";
import styles from "./Resizable.module.scss";

export type ResizableProps = HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  aspectRatio?: number;
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
  ...props
}: ResizableProps) {
  const ratio = aspectRatio && aspectRatio > 0 ? aspectRatio : undefined;
  const drag = useRef<
    | {
        height: number;
        pointerX: number;
        pointerY: number;
        sign: 1 | -1;
        width: number;
      }
    | undefined
  >(undefined);
  const [size, setSize] = useState<{ height?: number; width?: number }>({});
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
    "data-direction": props.direction,
    "data-resizing": resizing || undefined,
    style: {
      ...style,
      height: size.height ?? style?.height,
      width: size.width ?? style?.width,
    },
    ...omit(props, ["direction", "onResize"]),
  };

  const handle = (
    <div
      className={styles.Handle}
      onPointerCancel={stopResize}
      onPointerDown={(event) => {
        const element = event.currentTarget.parentElement;

        if (!element) return;

        const box = element.getBoundingClientRect();

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
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
        if (!drag.current) return;

        const deltaX =
          drag.current.sign * (event.clientX - drag.current.pointerX);
        const deltaY = event.clientY - drag.current.pointerY;
        const rawHeight = Math.max(40, drag.current.height + deltaY);
        const rawWidth = Math.max(40, drag.current.width + deltaX);
        const nextWidth =
          props.direction === "y" && ratio ? rawHeight * ratio : rawWidth;
        const nextHeight =
          props.direction !== "y" && ratio ? nextWidth / ratio : rawHeight;
        const nextSize = {
          height: props.direction === "x" && !ratio ? undefined : nextHeight,
          width: props.direction === "y" && !ratio ? undefined : nextWidth,
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
      {props.direction === "both" ? (
        <Divider direction="both" m={1} />
      ) : (
        <Divider
          direction={props.direction === "y" ? "x" : "y"}
          mx={props.direction === "y" ? 1 : 0}
          my={props.direction === "x" ? 1 : 0}
        />
      )}
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
