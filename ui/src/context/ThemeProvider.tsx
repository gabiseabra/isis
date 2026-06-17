import { ReactNode } from "react";
import { ToastProvider } from "../feedback/Toast";
import { OverlayProvider } from "../overlay/OverlayProvider";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <OverlayProvider>
      <ToastProvider>{children}</ToastProvider>
    </OverlayProvider>
  );
}
