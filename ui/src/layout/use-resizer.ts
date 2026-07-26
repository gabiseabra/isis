import { useWindowEvent } from "@mantine/hooks";
import { PointerEvent, RefCallback, useRef, useState } from "react";
import { Vector2 } from "threejs-math";

export type Size = {
  height: number;
  width: number;
};

export type Side = "top" | "bottom" | "right" | "left";
export type Edge = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type Position = Side | Edge;
export const Position = {
  toSide(position: Position): Side[] {
    return position.split(" ") as Side[];
  },
};

export type BaseResizableProps = {
  ref: RefCallback<HTMLElement>;
  onPointerDown(e: PointerEvent<HTMLElement>): void;
  onPointerUp(e: PointerEvent<HTMLElement>): void;
  onPointerMove(e: PointerEvent<HTMLElement>): void;
  onPointerCancel(e: PointerEvent<HTMLElement>): void;
};

type ResizerState = {
  position: Side | Edge;
  startMouse: Vector2;
  currentMouse: Vector2;
};

export type Resizer = {
  get currentState(): ResizerState | null;
  isResizing: boolean;
  start(position: Position, event: MouseEvent): void;
  move(position: Position, e: MouseEvent): void;
  stop(): void;
  register(position: Position): BaseResizableProps;
};

export type UseResizerOptions = {
  /** Current size state */
  size?: Partial<Size>;
  onResize?: (size: Size, event: PointerEvent<HTMLDivElement>) => void;
  aspectRatio?: number;
  disabled?: boolean;
  min?: Partial<Size>;
  max?: Partial<Size>;
};

export function useResizer(options: UseResizerOptions): Resizer {
  const stateRef = useRef<(ResizerState & { size: Size }) | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const clamp = (value: number, min = 0, max = Infinity) =>
    Math.min(max, Math.max(min, value));

  const start = (position: Position, event: MouseEvent) => {
    if (options.disabled) return;

    stateRef.current = {
      position,
      size: {
        width: options.size?.width ?? 0,
        height: options.size?.height ?? 0,
      },
      startMouse: new Vector2(event.clientX, event.clientY),
      currentMouse: new Vector2(event.clientX, event.clientY),
    };
    setIsResizing(true);
  };

  const stop = () => {
    stateRef.current = null;
    setIsResizing(false);
  };

  const move = (position: Position, event: MouseEvent) => {
    if (!stateRef.current) return;

    const state = stateRef.current;
    state.currentMouse = new Vector2(event.clientX, event.clientY);

    const horizontal =
      (position.includes("right") ? 1 : 0) -
      (position.includes("left") ? 1 : 0);
    const vertical =
      (position.includes("bottom") ? 1 : 0) -
      (position.includes("top") ? 1 : 0);
    const resizeDisplacement = {
      x: (state.currentMouse.x - state.startMouse.x) * horizontal,
      y: (state.currentMouse.y - state.startMouse.y) * vertical,
    };

    let width = state.size.width + resizeDisplacement.x;
    let height = state.size.height + resizeDisplacement.y;
    const resizeByWidth =
      horizontal &&
      (!vertical ||
        Math.abs(resizeDisplacement.x) >=
          Math.abs(resizeDisplacement.y * (options.aspectRatio ?? 1)));

    if (options.aspectRatio) {
      if (resizeByWidth) {
        height = width / options.aspectRatio;
      } else if (vertical) {
        width = height * options.aspectRatio;
      }
    }

    width = clamp(width, options.min?.width, options.max?.width);
    height = clamp(height, options.min?.height, options.max?.height);

    if (options.aspectRatio) {
      if (resizeByWidth) {
        height = clamp(
          width / options.aspectRatio,
          options.min?.height,
          options.max?.height,
        );
      } else if (vertical) {
        width = clamp(
          height * options.aspectRatio,
          options.min?.width,
          options.max?.width,
        );
      }
    }

    options.onResize?.(
      { width, height },
      event as unknown as PointerEvent<HTMLDivElement>,
    );
  };

  useWindowEvent("mousemove", (event) => {
    if (stateRef.current) move(stateRef.current.position, event);
  });
  useWindowEvent("mouseup", stop);

  return {
    get currentState() {
      return stateRef.current;
    },
    isResizing,
    start,
    stop,
    move,
    register: (position) => ({
      ref() {},
      onPointerDown(e) {
        start(position, e.nativeEvent);
        if (!options.disabled) e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove(e) {
        move(position, e.nativeEvent);
      },
      onPointerUp(e) {
        stop();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      },
      onPointerCancel(e) {
        stop();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      },
    }),
  };
}
