import { Spinner } from "@isis/ui/feedback/Spinner";
import { Col } from "@isis/ui/layout/FlexBox";

export function Loading() {
  return (
    <Col alignX="center" alignY="center">
      <Spinner size="l" />
    </Col>
  );
}
