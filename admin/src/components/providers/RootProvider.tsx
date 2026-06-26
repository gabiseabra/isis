import { ToastProvider } from "@isis/ui/feedback/Toast";
import { OverlayProvider } from "@isis/ui/overlay/OverlayProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "../../orpc/client";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <ToastProvider>{children}</ToastProvider>
      </OverlayProvider>
    </QueryClientProvider>
  );
}
