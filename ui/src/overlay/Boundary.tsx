import { Slot } from "radix-ui";
import {
  ComponentProps,
  createContext,
  FunctionComponent,
  Ref,
  useContext,
  useState,
} from "react";
import * as css from "../utils/css";

type Boundary = FunctionComponent<Omit<BoundaryProps, "context">>;

const BoundaryContext = createContext<{
  stack: { element: HTMLElement; padding?: number; context?: Boundary[] }[];
}>({
  stack: [],
});

export const createBoundary = (): Boundary => {
  function ScopedBoundary(props: Omit<BoundaryProps, "context">) {
    return <Boundary context={[ScopedBoundary]} {...props} />;
  }
  return ScopedBoundary;
};

export function useBoundary(context: Boundary) {
  const { element, padding } =
    useContext(BoundaryContext).stack.find(
      (boundary) => !boundary.context || boundary.context.includes(context),
    ) ?? {};
  const paddingPx =
    padding && css.toPx(css.computeProperty("--space", element)) * padding;

  return {
    element: element ?? document.body,
    padding,
    paddingPx,
  };
}

export type BoundaryProps = Omit<ComponentProps<"div">, "ref"> & {
  context?: Boundary[];
  padding?: number;
  asChild?: boolean;
  ref?: Ref<HTMLElement>;
};

export function Boundary({
  asChild,
  ref,
  context,
  padding,
  ...props
}: BoundaryProps) {
  const { stack } = useContext(BoundaryContext);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const boundaryRef = (element: HTMLElement | null) => {
    setElement(element);
    if (ref instanceof Function) ref(element);
    else if (ref) ref.current = element;
  };

  return (
    <BoundaryContext.Provider
      value={{
        stack: element ? [{ element, padding, context }, ...stack] : stack,
      }}
    >
      {asChild ? (
        <Slot.Root ref={boundaryRef} {...props} />
      ) : (
        <div ref={boundaryRef} {...props} />
      )}
    </BoundaryContext.Provider>
  );
}
