import { ReactNode } from "react";
import { ToastProvider } from "../feedback/Toast";
import { OverlayProvider } from "./OverlayProvider";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <OverlayProvider>
      <ToastProvider>{children}</ToastProvider>
    </OverlayProvider>
  );
}
