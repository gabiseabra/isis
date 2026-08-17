import { ReactNode } from "react";

type AnySlotFunction = (...args: any[]) => ReactNode;
export type Slot<F extends AnySlotFunction> = ReactNode | F;

export const Slot = {
  render<F extends AnySlotFunction>(
    f: Slot<F>,
    ...args: Parameters<F>
  ): ReactNode {
    return f instanceof Function ? f(...args) : f;
  },
};
