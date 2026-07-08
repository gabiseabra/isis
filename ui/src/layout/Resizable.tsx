import { Slot } from "radix-ui";
import { useRef, useState } from "react";
import { Divider } from "../display/Divider";
import { Box, BoxProps } from "./Box";
import styles from "./Resizable.module.scss";
import { Size, useResizer, UseResizerOptions } from "./use-resizer";

export type ResizableProps = BoxProps &
  Omit<UseResizerOptions, "size"> & {
    size?: Size;
    initialSize?: Size;
  };

export function Resizable({
  asChild,
  aspectRatio,
  children,
  className,
  style,
  disabled,
  direction,
  size: controlledSize,
  onResize,
  ...props
}: ResizableProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [localSize, setLocalSize] = useState<Size | null>();
  const size = controlledSize ?? localSize ?? undefined;
  const resizer = useResizer({
    aspectRatio,
    disabled,
    direction,
    containerRef,
    size,
    onResize(size, e) {
      setLocalSize(size);
      onResize?.(size, e);
    },
  });

  const Root = asChild ? Slot.Root : Box;

  return (
    <Root
      ref={containerRef}
      className={[styles.Resizable, className].filter(Boolean).join(" ")}
      data-direction={direction}
      data-resizing={resizer.resizing || undefined}
      style={{
        ...style,
        height: size?.height ?? style?.height,
        width: size?.width ?? style?.width,
      }}
      {...props}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}

      <div className={styles.Handle} {...resizer.register()}>
        {!disabled &&
          (direction === "both" ? (
            <Divider direction="both" m={1} />
          ) : (
            <Divider
              direction={direction === "y" ? "x" : "y"}
              mx={direction === "y" ? 1 : 0}
              my={direction === "x" ? 1 : 0}
            />
          ))}
      </div>
    </Root>
  );
}
