import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { EmptySearch, ErrorState } from "@isis/ui/feedback/EmptyState";
import { Col } from "@isis/ui/layout/FlexBox";
import { Nav, NavProps } from "@isis/ui/layout/Nav";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BiFolder } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";

type MediaTreeProps = NavProps & {
  path?: Path;
  onClickMedia?: (entry: Media) => void;
  onDoubleClickMedia?: (entry: Media) => void;
  /** auto focus on the path entry on change. */
  autoFocus?: boolean;
};

/**
 * top level media nav sidebar.
 */
export function MediaTree({
  path,
  autoFocus,
  loading,
  onClickMedia,
  onDoubleClickMedia,
  ...props
}: MediaTreeProps) {
  const childrenQuery = useQuery(
    orpcQuery.media.query.queryOptions({
      input: {
        page: 1,
        limit: 100,
        query: `type:eq:"folder" && parent_path:eq:"${path ?? ""}"`,
        sort: "updated_at",
        order: "desc",
      },
    }),
  );

  return (
    <Nav
      style={{ height: "100%", width: "100%", boxSizing: "border-box" }}
      loading={childrenQuery.isLoading || loading}
      {...props}
    >
      {childrenQuery.isError ? (
        <Col flex={1} alignY="center">
          <ErrorState title={extractErrorMessage(childrenQuery.error)} />
        </Col>
      ) : !childrenQuery.data?.items.length ? (
        <Col flex={1} alignY="center">
          <EmptySearch title="Sem resultados" />
        </Col>
      ) : (
        childrenQuery.data?.items.map((entry) => (
          <MediaTreeNode
            key={entry.id}
            path={path}
            autoFocus={autoFocus}
            entry={entry}
            onClickMedia={onClickMedia}
            onDoubleClickMedia={onDoubleClickMedia}
          />
        ))
      )}
    </Nav>
  );
}

export function MediaTreeNode({
  path,
  autoFocus,
  entry,
  onClickMedia,
  onDoubleClickMedia,
}: {
  path?: Path;
  autoFocus?: boolean;
  entry: Media;
  onClickMedia?: (entry: Media) => void;
  onDoubleClickMedia?: (entry: Media) => void;
}) {
  const active = path === entry.path || Path.contains(entry.path, path ?? "");
  const defaultOpen = Path.contains(entry.path, path ?? "");

  const [open, setOpen] = useState(active);
  const childrenQuery = useQuery(
    orpcQuery.media.query.queryOptions({
      input: {
        page: 1,
        limit: 100,
        parentId: entry.id,
        query: 'type:eq:"folder"',
        sort: "updated_at",
        order: "desc",
      },
    }),
  );

  useEffect(() => {
    if (autoFocus && defaultOpen) {
      setOpen(true);
    }
  }, [autoFocus, path, defaultOpen]);

  return (
    <Nav.Button
      icon={<BiFolder />}
      title={entry.name}
      open={open}
      active={active}
      onOpenChange={setOpen}
      onClick={() => onClickMedia?.(entry)}
      onDoubleClick={() => onDoubleClickMedia?.(entry)}
      loading={childrenQuery.isPending}
      collapsible={!!childrenQuery.data?.items.length}
    >
      {childrenQuery.data?.items.map((entry) => (
        <MediaTreeNode
          key={entry.id}
          path={path}
          autoFocus={autoFocus}
          entry={entry}
          onClickMedia={onClickMedia}
          onDoubleClickMedia={onDoubleClickMedia}
        />
      ))}
    </Nav.Button>
  );
}
