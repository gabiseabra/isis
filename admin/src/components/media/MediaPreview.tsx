import { MediaInput } from "@isis/common/dto/media/input";
import { extractErrorCode } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { entries } from "@isis/common/utils/object";
import { IconButton } from "@isis/ui/display/IconButton";
import { ErrorState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { useToast } from "@isis/ui/feedback/Toast";
import { Button } from "@isis/ui/form/Button";
import { Input } from "@isis/ui/form/Input";
import { useForm } from "@isis/ui/form/use-form";
import { Card, CardProps } from "@isis/ui/layout/Card";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { Table } from "@isis/ui/layout/Table";
import { Modal } from "@isis/ui/overlay/Modal";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";
import { useUpsertMediaMutation } from "../../orpc/media/use-upsert-media-mutation";

type MediaPreviewProps = CardProps & {
  mediaId: ID<"Media">;
  onDeleteMedia?: () => void;
};

const HIDDEN_METADATA_KEYS = ["storageKey"];

export function MediaPreview({
  mediaId,
  onDeleteMedia,
  style,
  ...props
}: MediaPreviewProps) {
  const toast = useToast();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({ input: { id: mediaId } }),
  );

  const upsertMediaQuery = useUpsertMediaMutation();

  const form = useForm({
    schema: MediaInput,
    initialValue: {
      ...entryQuery.data,
    },
    onSubmit(input) {
      upsertMediaQuery.mutate({
        id: mediaId,
        ...input,
      });
    },
  });

  function deleteMedia() {
    if (!entryQuery.data) {
      toast.show({
        type: "warning",
        message: "Carregando...",
      });
      return;
    }

    upsertMediaQuery.mutate(
      {
        ...entryQuery.data,
        deletedAt: new Date(),
      },
      {
        onSuccess() {
          onDeleteMedia?.();
        },
      },
    );
  }

  useEffect(() => {
    form.reset();
  }, [entryQuery.data?.id]);

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
            <Row wrap alignY="center" gap={1}>
              <Input
                placeholder="Nome do arquivo"
                style={{ flex: "1 1 300px", minWidth: 0 }}
                {...form.register("name")}
              />

              <Row flex="1 0 300px" style={{ minWidth: 300 }}>
                <Button
                  disabled={!form.hasUnsavedChanges}
                  loading={upsertMediaQuery.isPending}
                  onClick={() => form.submit()}
                  right={
                    <IconButton>
                      <BiTrash />
                    </IconButton>
                  }
                >
                  Salvar
                </Button>

                <Button color="red" onClick={() => setDeleteModalOpen(true)}>
                  Deletar
                </Button>
              </Row>
            </Row>

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

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Deletar arquivo?"
        footer={
          <Button
            color="red"
            onClick={() => {
              setDeleteModalOpen(false);
              deleteMedia();
            }}
          >
            Deletar
          </Button>
        }
      >
        Deseja mesmo deletar "{entryQuery.data?.name ?? "Unknown"}"?
      </Modal>
    </Card>
  );
}
