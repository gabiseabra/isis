import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { Divider } from "@isis/ui/display/Divider";
import { EmptyState } from "@isis/ui/feedback/EmptyState";
import { Col } from "@isis/ui/layout/FlexBox";
import { Nav, NavProps } from "@isis/ui/layout/Nav";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BiError, BiFolder } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";
import { MediaControls } from "./MediaControls";
import { MediaMetadata } from "./MediaMetadata";

type MediaNavProps = Omit<NavProps, "children"> & {
  path?: Path;
  onClickMedia?: (entry: Media) => void;
  /** auto focus on the path entry on change. */
  autoFocus?: boolean;
};

/**
 * top level media nav sidebar.
 */
export function MediaNav({
  path,
  header = (
    <Col gap={1}>
      <MediaMetadata path={path} />

      <Divider direction="x" />
    </Col>
  ),
  footer = (
    <Col gap={1}>
      <Divider direction="x" />

      <MediaControls path={path} />
    </Col>
  ),
  loading,
  onClickMedia,
  ...props
}: MediaNavProps) {
  const childrenQuery = useQuery(
    orpcQuery.media.queryChildren.queryOptions({
      input: {
        page: 1,
        limit: 100,
        sort: "updated_at",
      },
    }),
  );

  return (
    <Nav
      style={{ height: "100%", boxSizing: "border-box" }}
      loading={childrenQuery.isLoading || loading}
      header={header}
      footer={footer}
      {...props}
    >
      {childrenQuery.isError ? (
        <Col flex={1} alignY="center">
          <EmptyState
            size="m"
            color="red"
            icon={<BiError />}
            title={extractErrorMessage(childrenQuery.error)}
          />
        </Col>
      ) : !childrenQuery.data?.items.length ? (
        <Col flex={1} alignY="center">
          <EmptyState size="m" title="Sem resultados" />
        </Col>
      ) : (
        childrenQuery.data?.items.map((entry) => (
          <MediaNavItem
            path={path}
            key={entry.id}
            entry={entry}
            onClickMedia={onClickMedia}
          />
        ))
      )}
    </Nav>
  );
}

export function MediaNavItem({
  entry,
  onClickMedia,
}: {
  path?: Path;
  entry: Media;
  onClickMedia?: (entry: Media) => void;
}) {
  const [open, setOpen] = useState(false);
  const childrenQuery = useQuery(
    orpcQuery.media.queryChildren.queryOptions({
      enabled: open,
      input: {
        page: 1,
        limit: 100,
        rootId: entry.id,
      },
    }),
  );

  return (
    <Nav.Button
      icon={<BiFolder />}
      title={entry.name}
      open={open}
      onOpenChange={setOpen}
    >
      {childrenQuery.data?.items.map((entry) => (
        <MediaNavItem
          key={entry.id}
          entry={entry}
          onClickMedia={() => onClickMedia?.(entry)}
        />
      ))}
    </Nav.Button>
  );
}
