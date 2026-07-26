import { extractErrorCode } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { ErrorState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
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

  const src =
    entryQuery.data &&
    `${import.meta.env.VITE_API_URL}/admin/media/${entryQuery.data.path}`;

  console.log(entryQuery.data, src);
  return (
    <Card
      elevation={2}
      alignY="center"
      alignX="center"
      style={{ borderRadius: 0, height: "100%", width: "100%", ...style }}
      {...props}
    >
      {entryQuery.isPending ? (
        <Spinner size="m" />
      ) : entryQuery.isError ? (
        <ErrorState title={extractErrorCode(entryQuery.error)} />
      ) : (
        <>
          {entryQuery.data.metadata.type === "file" &&
            (entryQuery.data.metadata.fileType === "application/pdf" ? (
              <iframe src={src} style={{ width: "100%", height: "100%" }} />
            ) : (
              <img src={src} />
            ))}
        </>
      )}
    </Card>
  );
}
