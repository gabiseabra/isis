import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { Slot } from "@isis/common/utils/slot";
import { IconControl } from "@isis/ui/display/IconControl";
import { Text } from "@isis/ui/display/Text";
import { EmptyState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Button } from "@isis/ui/form/Button";
import { Box, BoxProps } from "@isis/ui/layout/Box";
import { Col } from "@isis/ui/layout/FlexBox";
import { useQuery } from "@tanstack/react-query";
import { MouseEvent, ReactNode } from "react";
import { BiFolder } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";

type MediaChildrenProps = Omit<BoxProps, "children"> & {
  path?: Path;
  loading?: boolean;
  error?: Slot<(error: unknown) => ReactNode>;
  emptyState?: ReactNode;
  onClickMedia?: (entry: Media) => void;
  onDoubleClickMedia?: (entry: Media) => void;
};

export function MediaChildren({
  path,
  loading,
  error = (error) => (
    <EmptyState size="m" color="red" title={extractErrorMessage(error)} />
  ),
  emptyState = <EmptyState size="m" title="Nenhum resultado" />,
  onClickMedia,
  onClick,
  onDoubleClickMedia,
  onDoubleClick,
  style,
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
          <MediaFile
            key={entry.id}
            entry={entry}
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

function MediaFile({
  entry,
  onClick,
  onDoubleClick,
}: {
  entry: Media;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onDoubleClick?: (e: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <Col asChild p={1} width={86} height={86}>
      <Button
        size="auto"
        variant="sheer"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <IconControl size="m">
          <BiFolder />
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
