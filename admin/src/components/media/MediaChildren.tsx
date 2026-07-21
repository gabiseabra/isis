import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { Slot } from "@isis/common/utils/slot";
import { IconControl } from "@isis/ui/display/IconControl";
import { Text } from "@isis/ui/display/Text";
import { EmptySearch, ErrorState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Button } from "@isis/ui/form/Button";
import { Box, BoxProps } from "@isis/ui/layout/Box";
import { Col } from "@isis/ui/layout/FlexBox";
import { useQuery } from "@tanstack/react-query";
import { MouseEvent, ReactNode } from "react";
import { BiFolder, BiImage } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";
import styles from "./MediaChildren.module.scss";

type MediaChildrenProps = Omit<BoxProps, "children"> & {
  path?: Path;
  activePath?: Path;
  loading?: boolean;
  error?: Slot<(error: unknown) => ReactNode>;
  emptyState?: ReactNode;
  onClickMedia?: (entry: Media) => void;
  onDoubleClickMedia?: (entry: Media) => void;
};

export function MediaChildren({
  path,
  activePath,
  loading,
  error = (error) => <ErrorState size="m" title={extractErrorMessage(error)} />,
  emptyState = <EmptySearch size="m" title="Nenhum resultado" />,
  onClickMedia,
  onClick,
  onDoubleClickMedia,
  onDoubleClick,
  style,
  className,
  ...props
}: MediaChildrenProps) {
  const childrenQuery = useQuery(
    orpcQuery.media.queryChildren.queryOptions({
      input: {
        page: 1,
        limit: 100,
        path,
      },
    }),
  );

  return (
    <Box
      style={{
        flex: 1,
        ...style,
      }}
      className={[styles.MediaChildren, className].filter(Boolean).join(" ")}
      data-error={childrenQuery.isError || undefined}
      data-loading={childrenQuery.isLoading || loading || undefined}
      data-empty={!childrenQuery.data?.items.length || undefined}
      {...props}
    >
      {childrenQuery.isLoading || loading ? (
        <Spinner size="m" color="blue" />
      ) : childrenQuery.isError ? (
        Slot.extract(error, childrenQuery.error)
      ) : !childrenQuery.data?.items.length ? (
        emptyState
      ) : (
        childrenQuery.data.items.map((entry) => (
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
        <IconControl size="l">
          {entry.metadata.type === "folder" ? <BiFolder /> : <BiImage />}
        </IconControl>

        <Text
          noWrap
          size="caption"
          color="muted"
          style={{ fontSize: "0.75em" }}
        >
          {entry.name}
        </Text>
      </Button>
    </Col>
  );
}
