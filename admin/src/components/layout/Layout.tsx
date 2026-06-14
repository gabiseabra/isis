import { Col } from "@isis/ui/layout/FlexBox";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return <Col as="main">{children}</Col>;
}
