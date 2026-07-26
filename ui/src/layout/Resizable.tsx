import { CSSValue } from "@isis/common/utils/css-property";
import { Slot } from "@isis/common/utils/slot";
import { useResizeObserver } from "@mantine/hooks";
import { Slot as RadixSlot } from "radix-ui";
import { ReactNode, useState } from "react";
import { Divider, DividerProps } from "../display/Divider";
import { _space } from "../utils/css";
import { Box, BoxProps } from "./Box";
import styles from "./Resizable.module.scss";
import { Position, Size, useResizer, UseResizerOptions } from "./use-resizer";

export type ResizableProps = Omit<BoxProps, "side"> &
  UseResizerOptions & {
    frame?: Slot<(children: ReactNode[]) => ReactNode>;
    positions: Position[];
    hitArea?: CSSValue;
    frameLength?: CSSValue;
    edgeSize?: CSSValue;
  };

export const _resizableHitArea = `--resizable-hit-area`;
export const _resizableFrameLength = `--resizable-frame-length`;

export function Resizable({
  aspectRatio,
  children,
  className,
  style,
  disabled,
  min,
  max,
  size: controlledSize,
  onResize,
  positions,
  frame = (children) => <Resizable.Frame>{children}</Resizable.Frame>,
  hitArea,
  frameLength,
  ...props
}: ResizableProps) {
  const [containerRef, actualSize] = useResizeObserver();
  const [localSize, setLocalSize] = useState<Size | null>();
  const size = controlledSize ?? localSize ?? actualSize;

  const resizable = useResizer({
    aspectRatio,
    disabled,
    min,
    max,
    size,
    onResize(size, e) {
      setLocalSize(size);
      onResize?.(size, e);
    },
  });

  return (
    <Box
      ref={containerRef}
      className={[styles.Resizable, className].filter(Boolean).join(" ")}
      data-resizing={resizable.isResizing || undefined}
      style={{
        [_resizableHitArea]: hitArea,
        [_resizableFrameLength]: frameLength,
        height: size?.height ?? style?.height ?? "fit-content",
        width: size?.width ?? style?.width ?? "fit-content",
        ...style,
      }}
      {...props}
    >
      {props.asChild ? (
        <RadixSlot.Slottable>{children}</RadixSlot.Slottable>
      ) : (
        children
      )}

      {Slot.extract(
        frame,
        positions.map((position) => (
          <div
            key={position}
            className={styles.Handle}
            {...resizable.register(position)}
          >
            <FrameElement position={position} />
          </div>
        )),
      )}
    </Box>
  );
}

Resizable.Frame = function Frame({ className, ...props }: BoxProps) {
  return (
    <Box
      className={[styles.Frame, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

type FrameElementProps = Omit<DividerProps, "direction"> & {
  position: Position;
};

function FrameElement({ position, ...props }: FrameElementProps) {
  props.className = [props.className, styles.FrameSide]
    .filter(Boolean)
    .join(" ");

  if (position === "top")
    return <Divider data-side="top" direction="x" {...props} />;
  if (position === "bottom")
    return <Divider data-side="bottom" direction="x" {...props} />;
  if (position === "left")
    return <Divider data-side="left" direction="y" {...props} />;
  if (position === "right")
    return <Divider data-side="right" direction="y" {...props} />;
  if (position === "top-left")
    return <Divider data-side="top-left" direction="both" {...props} />;
  if (position === "top-right")
    return <Divider data-side="top-right" direction="both" {...props} />;
  if (position === "bottom-left")
    return <Divider data-side="bottom-left" direction="both" {...props} />;
  if (position === "bottom-right")
    return <Divider data-side="bottom-right" direction="both" {...props} />;
  return position satisfies never;
}
