import { ReactNode } from "react";
import { OverlayProvider } from "./OverlayProvider";
import { ToastProvider } from "./ToastProvider";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <OverlayProvider>
      <ToastProvider>{children}</ToastProvider>
    </OverlayProvider>
  );
}
