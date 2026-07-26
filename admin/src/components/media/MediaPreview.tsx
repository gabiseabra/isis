import { extractErrorCode } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { entries } from "@isis/common/utils/object";
import { ErrorState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Card, CardProps } from "@isis/ui/layout/Card";
import { Col } from "@isis/ui/layout/FlexBox";
import { Table } from "@isis/ui/layout/Table";
import { useQuery } from "@tanstack/react-query";
import { orpcQuery } from "../../orpc/client";

type MediaPreviewProps = CardProps & {
  mediaId: ID<"Media">;
};

const HIDDEN_METADATA_KEYS = ["storageKey"];

export function MediaPreview({ mediaId, style, ...props }: MediaPreviewProps) {
  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({ input: { id: mediaId } }),
  );

  const src =
    entryQuery.data &&
    `${import.meta.env.VITE_API_URL}/admin/media/${entryQuery.data.path}`;

  return (
    <Card
      direction="inline"
      gap={0}
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
              <iframe
                src={`${src}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                style={{ width: "auto", height: "100%", border: "none" }}
              />
            ) : (
              <img src={src} style={{ width: "auto", height: "100%" }} />
            ))}

          <Col flex={1} height="100%" p={2} style={{ overflow: "auto" }}>
            <Table
              columns={["element"]}
              rows={entries(entryQuery.data.metadata)
                .map(([key, value]) => ({
                  key: String(key),
                  value,
                }))
                .filter((row) => !HIDDEN_METADATA_KEYS.includes(row.key))}
              cell={(row) => String(row.value)}
              index={(row) => (
                <Table.Label>
                  {{
                    type: "Tipo",
                    fileName: "Nome Original",
                    fileType: "Mime",
                    fileSize: "Tamanho",
                    fileExtension: "Extensão",
                  }[row.key] ?? row.key}
                </Table.Label>
              )}
            />
          </Col>
        </>
      )}
    </Card>
  );
}
