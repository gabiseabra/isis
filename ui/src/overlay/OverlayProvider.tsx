import { createContext, ReactNode, useContext, useState } from "react";

const OverlayContext = createContext<{
  root: HTMLElement;
}>({
  root: document.body,
});

export function useOverlay() {
  return useContext(OverlayContext);
}

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  return (
    <OverlayContext.Provider
      value={{
        root: overlayRoot ?? document.body,
      }}
    >
      {children}

      <div ref={setOverlayRoot} />
    </OverlayContext.Provider>
  );
}
