import { ID } from "@isis/common/utils/id";
import { Card, CardProps } from "@isis/ui/layout/Card";
import { useQuery } from "@tanstack/react-query";
import { orpcQuery } from "../../orpc/client";

type MediaPreviewProps = CardProps & {
  mediaId: ID<"Media">;
};

export function MediaPreview({ mediaId, style, ...props }: MediaPreviewProps) {
  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({ input: { id: mediaId } }),
  );
  const mimeType =
    entryQuery.data?.metadata.mimeType ?? entryQuery.data?.metadata.fileType;
  const src = `${import.meta.env.VITE_API_URL}/admin/media/file?id=${encodeURIComponent(mediaId)}`;

  return (
    <Card
      elevation={2}
      alignY="center"
      alignX="center"
      style={{ borderRadius: 0, height: "100%", width: "100%", ...style }}
      {...props}
    >
      {typeof mimeType === "string" &&
        (mimeType.startsWith("image/") ? (
          <img src={src} style={{ maxHeight: "100%", maxWidth: "100%" }} />
        ) : (
          mimeType === "application/pdf" && (
            <iframe
              src={src}
              style={{ border: 0, height: "100%", width: "100%" }}
            />
          )
        ))}
    </Card>
  );
}
