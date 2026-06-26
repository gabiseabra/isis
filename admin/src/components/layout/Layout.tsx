import { IconControl } from "@isis/ui/display/IconControl";
import { Logo } from "@isis/ui/display/Logo";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Row as="header" alignX="space-between" p={1}>
        <IconControl size="auto" color="primary" style={{ height: 46 }}>
          <Logo />
        </IconControl>
      </Row>

      <Col as="main" alignX="center">
        {children}
      </Col>
    </>
  );
}
