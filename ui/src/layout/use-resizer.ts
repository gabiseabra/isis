import { PointerEvent, RefCallback, RefObject, useRef, useState } from "react";
import { Vector2 } from "threejs-math";

export type Size = {
  height: number;
  width: number;
};

export type BaseResizableProps = {
  ref: RefCallback<HTMLElement>;
  onPointerDown(e: PointerEvent<HTMLElement>): void;
  onPointerUp(e: PointerEvent<HTMLElement>): void;
  onPointerMove(e: PointerEvent<HTMLElement>): void;
  onPointerCancel(e: PointerEvent<HTMLElement>): void;
};

type ResizerState = {
  pointer: Vector2;
  direction: -1 | 0 | 1;
};

export type Resizer = {
  get state(): ResizerState | null;
  resizing: boolean;
  start(e: PointerEvent): void;
  stop(): void;
  move(e: PointerEvent): void;
  register(): BaseResizableProps;
};

export type UseResizerOptions = {
  size?: Size;
  onResize?: (size: Size, event: PointerEvent<HTMLDivElement>) => void;
  direction: "x" | "y" | "both";
  aspectRatio?: number;
  disabled?: boolean;
  min?: Size;
  max?: Size;
  containerRef?: RefObject<HTMLElement | null>;
};

export function useResizer(options: UseResizerOptions): Resizer {
  const resizableRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{
    initialSize: Size;
    pointer: Vector2;
    direction: -1 | 0 | 1;
  }>(null);
  const [resizing, setResizing] = useState(false);

  const start = (e: PointerEvent<HTMLElement>) => {
    if (options.disabled) return;

    const element =
      options.containerRef?.current ?? resizableRef.current ?? e.currentTarget;

    dragRef.current = {
      initialSize: (() => {
        if (options.size) return options.size;
        const bbox = element.getBoundingClientRect();
        return { width: bbox.width, height: bbox.height };
      })(),
      pointer: new Vector2(e.clientX, e.clientY),
      direction: 0,
    };

    setResizing(true);
  };
  const stop = () => {
    dragRef.current = null;
    setResizing(false);
  };
  const move = (e: PointerEvent) => {
    if (!dragRef.current) return;

    const delta = new Vector2(e.clientX, e.clientY).sub(
      dragRef.current.pointer,
    );

    const nextSize = {
      width: Math.min(
        options.max?.width ?? Infinity,
        Math.max(
          options.min?.width ?? 0,
          options.aspectRatio && options.direction === "y"
            ? (dragRef.current.initialSize.height + delta.y) *
                options.aspectRatio
            : dragRef.current.initialSize.width +
                (options.direction === "y" ? 0 : delta.x),
        ),
      ),
      height: Math.min(
        options.max?.height ?? Infinity,
        Math.max(
          options.min?.height ?? 0,
          options.aspectRatio && options.direction !== "y"
            ? (dragRef.current.initialSize.width + delta.x) /
                options.aspectRatio
            : dragRef.current.initialSize.height +
                (options.direction === "x" ? 0 : delta.y),
        ),
      ),
    };

    options.onResize?.(nextSize, e as PointerEvent<HTMLDivElement>);
  };

  return {
    get state() {
      return dragRef.current;
    },
    resizing,
    start,
    stop,
    move,
    register: () => ({
      ref(element) {
        resizableRef.current = element;
      },
      onPointerDown: (e) => {
        start(e);
        if (!options.disabled) e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove: (e) => {
        move(e);
      },
      onPointerUp: (e) => {
        stop();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      },
      onPointerCancel: (e) => {
        stop();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      },
    }),
  };
}
