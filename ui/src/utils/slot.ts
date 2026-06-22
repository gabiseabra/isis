import { ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is okay for generics
type SlotFunction = (...args: any[]) => ReactNode;
export type Slot<F extends SlotFunction> = ReactNode | F;

export const Slot = {
  render<F extends SlotFunction>(
    f: Slot<F>,
    ...args: Parameters<F>
  ): ReactNode {
    return f instanceof Function ? f(...args) : f;
  },
};
