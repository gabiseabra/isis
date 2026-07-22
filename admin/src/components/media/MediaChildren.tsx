import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { Slot } from "@isis/common/utils/slot";
import { IconControl } from "@isis/ui/display/IconControl";
import { Text } from "@isis/ui/display/Text";
import { EmptySearch, ErrorState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { useToast } from "@isis/ui/feedback/Toast";
import { Button } from "@isis/ui/form/Button";
import { FileUploadOverlay } from "@isis/ui/form/FileUpload";
import { Box, BoxProps } from "@isis/ui/layout/Box";
import { Col } from "@isis/ui/layout/FlexBox";
import { useQuery } from "@tanstack/react-query";
import { MouseEvent, ReactNode } from "react";
import { BiFolder, BiImage } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";
import { useUploadMediaMutation } from "../../orpc/media/use-upload-media-mutation";
import styles from "./MediaChildren.module.scss";

type MediaChildrenProps = Omit<BoxProps, "children"> & {
  rootId?: ID<"Media">;
  activePath?: Path;
  loading?: boolean;
  error?: Slot<(error: unknown) => ReactNode>;
  emptyState?: ReactNode;
  onClickMedia?: (entry: Media) => void;
  onDoubleClickMedia?: (entry: Media) => void;
  onCreateMedia?: (entry: Media) => void;
};

export function MediaChildren({
  rootId,
  activePath,
  loading,
  error = (error) => <ErrorState title={extractErrorMessage(error)} />,
  emptyState = <EmptySearch title="Nenhum resultado" />,
  onClickMedia,
  onClick,
  onDoubleClickMedia,
  onDoubleClick,
  onCreateMedia,
  style,
  className,
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
        rootId,
      },
    }),
  );

  const isLoading = loading || childrenQuery.isLoading;
  const isError = childrenQuery.isError;
  const isEmpty = !childrenQuery.data?.items.length;

  return (
    <FileUploadOverlay
      loading={fileUploadMutation.isPending}
      onChangeValue={(file) =>
        fileUploadMutation.mutate({
          parentId: rootId,
          file,
        })
      }
      width="100%"
      height="100%"
    >
      <Box
        style={{
          flex: 1,
          boxSizing: "border-box",
          overflowY: "auto",
          height: isLoading || isError || isEmpty ? "100%" : "fit-content",
          ...style,
        }}
        className={[styles.MediaChildren, className].filter(Boolean).join(" ")}
        data-error={isError || undefined}
        data-loading={isLoading || undefined}
        data-empty={isEmpty || undefined}
        {...props}
      >
        {isLoading ? (
          <Spinner size="m" color="blue" />
        ) : isError ? (
          Slot.extract(error, childrenQuery.error)
        ) : isEmpty ? (
          emptyState
        ) : (
          childrenQuery.data?.items.map((entry) => (
            <MediaEntry
              key={entry.id}
              entry={entry}
              active={activePath === entry.path}
              onClick={(e) => {
                onClick?.(e);
                onClickMedia?.(entry);
              }}
              onDoubleClick={(e) => {
                onDoubleClick?.(e);
                onDoubleClickMedia?.(entry);
              }}
            />
          ))
        )}
      </Box>
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
