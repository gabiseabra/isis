import { ID } from "@isis/common/utils/id";
import { Box } from "@isis/ui/layout/Box";
import { Col } from "@isis/ui/layout/FlexBox";

type MediaPreviewProps = {
  mediaId: ID<"Media">;
};

export function MediaPreview({}: MediaPreviewProps) {
  return (
    <Col height={400} width="100%" alignY="center" alignX="center">
      lmao
    </Col>
  );
}
