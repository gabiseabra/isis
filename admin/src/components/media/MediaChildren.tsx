import { Media } from "@isis/common/dto/media";
import { MediaInput } from "@isis/common/dto/media/input";
import { QueryMediaInput } from "@isis/common/dto/media/query-input";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { IconControl } from "@isis/ui/display/IconControl";
import { Text } from "@isis/ui/display/Text";
import { EmptySearch, ErrorState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Toast } from "@isis/ui/feedback/Toast";
import { Button } from "@isis/ui/form/Button";
import { FileUploadOverlay } from "@isis/ui/form/FileUpload";
import { BoxProps } from "@isis/ui/layout/Box";
import { Col, FlexBox } from "@isis/ui/layout/FlexBox";
import { skipToken, useQuery } from "@tanstack/react-query";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { BiFolder, BiImage, BiRefresh } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";
import { useUploadMediaMutation } from "../../orpc/media/use-upload-media-mutation";

type MediaChildrenProps = Omit<BoxProps, "children"> & {
  path?: Path;
  isActive?: (entry: Media) => boolean;
  loading?: boolean;
  filters?: Omit<
    QueryMediaInput,
    "limit" | "page" | "offset" | "order" | "sort"
  >;
  onClickMedia?: (entry: Media, event: MouseEvent) => void;
  onDoubleClickMedia?: (entry: Media, event: MouseEvent) => void;
  onCreateMedia?: (entry: Media) => void;
};

export function MediaChildren({
  path,
  isActive,
  loading,
  onClickMedia,
  onDoubleClickMedia,
  onCreateMedia,
  style,
  filters,
  ...props
}: MediaChildrenProps) {
  const [pendingUploads, setPendingUploads] = useState<
    {
      id: number;
      file: File;
    }[]
  >([]);

  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({ input: path ? { path } : skipToken }),
  );
  const childrenQuery = useQuery(
    orpcQuery.media.query.queryOptions({
      input: {
        page: 1,
        limit: 100,
        query: `parent_path = "${path ?? ""}"`,
        sort: "updated_at",
        order: "desc",
        ...filters,
      },
    }),
  );

  const isLoading = loading || childrenQuery.isLoading;
  const isError = childrenQuery.isError;
  const isEmpty = !childrenQuery.data?.items.length;

  return (
    <FileUploadOverlay
      asChild
      multiple
      onChangeValue={(files) => {
        setPendingUploads((uploads) => [
          ...uploads,
          ...files.map((file) => ({
            id: Math.random(),
            file,
          })),
        ]);
      }}
    >
      <FlexBox
        direction="inline"
        style={{
          flex: 1,
          overflowY: "auto",
          width: "100%",
          height: "100%",
          ...style,
        }}
        {...props}
      >
        <FlexBox
          direction="inline"
          wrap
          flex={1}
          alignY="center"
          alignX={isLoading || isError || isEmpty ? "center" : "start"}
          style={{
            boxSizing: "border-box",
            width: "100%",
            height: isLoading || isError || isEmpty ? "100%" : "fit-content",
            ...style,
          }}
        >
          {isLoading ? (
            <Spinner size="m" color="blue" />
          ) : isError ? (
            <ErrorState title={extractErrorMessage(childrenQuery.error)} />
          ) : isEmpty ? (
            <EmptySearch title="Nenhum resultado">
              Arraste aqui para adicionar arquivos.
            </EmptySearch>
          ) : (
            childrenQuery.data?.items.map((entry) => (
              <MediaEntry
                key={entry.id}
                entry={entry}
                active={isActive?.(entry)}
                onClick={(e) => {
                  onClickMedia?.(entry, e);
                }}
                onDoubleClick={(e) => {
                  onDoubleClickMedia?.(entry, e);
                }}
              />
            ))
          )}
        </FlexBox>

        {pendingUploads.map(({ id, file }) => (
          <MediaUpload
            key={id}
            input={{
              file,
              parentId: entryQuery.data?.id,
              name: file.name,
              tags: [],
              metadata: {},
            }}
            onSuccess={onCreateMedia}
            onClose={() =>
              setPendingUploads((uploads) => uploads.filter((u) => u.id !== id))
            }
          />
        ))}
      </FlexBox>
    </FileUploadOverlay>
  );
}

function MediaUpload({
  input,
  onClose,
  onSuccess,
  onError,
}: {
  input: MediaInput & {
    file: File;
  };
  onClose?: () => void;
  onSuccess?: (media: Media) => void;
  onError?: (error: unknown) => void;
}) {
  const controller = useMemo(() => new AbortController(), []);

  const [upload, setUpload] = useState<
    | { status: "success"; media: Media }
    | { status: "error"; error: unknown }
    | { status: "pending" }
  >({ status: "pending" });

  const uploadMutation = useUploadMediaMutation({
    onSuccess(media) {
      setUpload({ status: "success", media });
      onSuccess?.(media);
    },
    onError(error) {
      setUpload({ status: "error", error });
      onError?.(error);
    },
  });

  function startUpload() {
    setUpload({ status: "pending" });
    uploadMutation.mutate({
      ...input,
      signal: controller.signal,
    });
  }

  useEffect(() => {
    startUpload();

    return () => {
      controller.abort();
    };
  }, []);

  if (upload.status === "error")
    return (
      <Toast
        type="error"
        open
        onClose={() => onClose?.()}
        duration={3000}
        title="Upload do arquivo falhou"
      >
        {extractErrorMessage(upload.error)}
      </Toast>
    );

  if (upload.status === "success")
    return (
      <Toast
        type="success"
        open
        onClose={() => onClose?.()}
        duration={3000}
        title="Arquivo criado"
      >
        {upload.media.name}

        <Button variant="sheer" color="red" right={<BiRefresh />}>
          Tentar de novo
        </Button>
      </Toast>
    );

  return (
    <Toast
      type="info"
      open={uploadMutation.isPending}
      onClose={() => {
        controller.abort();
        onClose?.();
      }}
      duration={Infinity}
      progress={uploadMutation.progress}
      title="Subindo arquivo"
    >
      {input.name}
    </Toast>
  );
}

function MediaEntry({
  entry,
  active,
  onClick,
  onDoubleClick,
}: {
  entry: Media;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onDoubleClick?: (e: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <Col asChild p={1} width={86} height={86}>
      <Button
        size="auto"
        pressed={active}
        variant="sheer"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <IconControl size="l" color={active ? "blue" : undefined}>
          {entry.metadata.type === "folder" ? <BiFolder /> : <BiImage />}
        </IconControl>

        <Text
          noWrap
          size="caption"
          color={active ? "blue" : "muted"}
          style={{ fontSize: "0.75em" }}
        >
          {entry.name}
        </Text>
      </Button>
    </Col>
  );
}
