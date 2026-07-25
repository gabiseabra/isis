import { PointerEvent, RefCallback, RefObject, useRef, useState } from "react";
import { Vector2, Vector3 } from "threejs-math";

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
  start(e: PointerEvent): void;
  stop(): void;
  move(e: PointerEvent): void;
  register(position: Position): BaseResizableProps;
};

export type UseResizerOptions = {
  size?: Partial<Size>;
  onResize?: (size: Size, event: PointerEvent<HTMLDivElement>) => void;
  aspectRatio?: number;
  disabled?: boolean;
  min?: Partial<Size>;
  max?: Partial<Size>;
};

export function useResizer(options: UseResizerOptions): Resizer {
  // todo only addcode here and do not touch anything else

  return {
    isResizing,
    start,
    stop,
    move,
    register: () => ({
      // todo
    }),
  };
}
