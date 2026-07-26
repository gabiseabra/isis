import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { IconControl } from "@isis/ui/display/IconControl";
import { Text } from "@isis/ui/display/Text";
import { EmptySearch, ErrorState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Toast, useToast } from "@isis/ui/feedback/Toast";
import { Button } from "@isis/ui/form/Button";
import { FileUploadOverlay } from "@isis/ui/form/FileUpload";
import { BoxProps } from "@isis/ui/layout/Box";
import { Col, FlexBox } from "@isis/ui/layout/FlexBox";
import { useQuery } from "@tanstack/react-query";
import { MouseEvent } from "react";
import { BiFolder, BiImage } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";
import { useUploadMediaMutation } from "../../orpc/media/use-upload-media-mutation";

type MediaChildrenProps = Omit<BoxProps, "children"> & {
  mediaId?: ID<"Media">;
  activePath?: Path;
  loading?: boolean;
  onClickMedia?: (entry: Media, event: MouseEvent) => void;
  onDoubleClickMedia?: (entry: Media, event: MouseEvent) => void;
  onCreateMedia?: (entry: Media) => void;
};

export function MediaChildren({
  mediaId,
  activePath,
  loading,
  onClickMedia,
  onDoubleClickMedia,
  onCreateMedia,
  style,
  ...props
}: MediaChildrenProps) {
  const toast = useToast();
  const fileUploadMutation = useUploadMediaMutation({
    onSuccess(entry) {
      toast.show({
        type: "success",
        message: `Arquivo criado: ${entry.name}`,
      });

      onCreateMedia?.(entry);
    },
    onError(error) {
      toast.show({
        type: "error",
        title: "Houve um erro subindo o arquivo",
        message: extractErrorMessage(error),
      });
    },
  });
  const childrenQuery = useQuery(
    orpcQuery.media.queryChildren.queryOptions({
      input: {
        page: 1,
        limit: 100,
        rootId: mediaId,
      },
    }),
  );

  const isLoading = loading || childrenQuery.isLoading;
  const isError = childrenQuery.isError;
  const isEmpty = !childrenQuery.data?.items.length;

  return (
    <FileUploadOverlay
      asChild
      loading={fileUploadMutation.isPending}
      onChangeValue={(file) =>
        fileUploadMutation.mutate({
          parentId: mediaId,
          file,
        })
      }
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
                active={activePath === entry.path}
                onClick={(e) => {
                  onClickMedia?.(entry, e);
                }}
                onDoubleClick={(e) => {
                  onDoubleClickMedia?.(entry, e);
                }}
              />
            ))
          )}

          <Button onClick={() => toast.show({ type: "error", message: "123" })}>
            show toast
          </Button>
          <Toast
            open
            // open={fileUploadMutation.isPending}
            onClose={() => {}}
            type="info"
            progress={0.41}
          >
            Uploading...
          </Toast>
        </FlexBox>
      </FlexBox>
    </FileUploadOverlay>
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
