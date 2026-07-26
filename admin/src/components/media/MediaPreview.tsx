import { ID } from "@isis/common/utils/id";
import { Box } from "@isis/ui/layout/Box";
import { Card, CardProps } from "@isis/ui/layout/Card";
import { Col } from "@isis/ui/layout/FlexBox";
import { useQuery } from "@tanstack/react-query";
import { orpcQuery } from "../../orpc/client";

type MediaPreviewProps = CardProps & {
  mediaId: ID<"Media">;
};

export function MediaPreview({ mediaId, style, ...props }: MediaPreviewProps) {
  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({ input: { id: mediaId } }),
  );

  return (
    <Card
      elevation={2}
      alignY="center"
      alignX="center"
      style={{ borderRadius: 0, height: "100%", width: "100%", ...style }}
      {...props}
    >
      lmao
    </Card>
  );
}
