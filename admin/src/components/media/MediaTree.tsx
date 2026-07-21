import { Media } from "@isis/common/dto/media";
import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { EmptySearch, ErrorState } from "@isis/ui/feedback/EmptyState";
import { Col, Row } from "@isis/ui/layout/FlexBox";
import { Nav, NavProps } from "@isis/ui/layout/Nav";
import { Resizable } from "@isis/ui/layout/Resizable";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BiFolder } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";
import styles from "./MediaTree.module.scss";

type MediaTreeProps = NavProps & {
  path?: Path;
  onClickMedia?: (entry: Media) => void;
  onDoubleClickMedia?: (entry: Media) => void;
  /** auto focus on the path entry on change. */
  autoFocus?: boolean;
  width?: number;
  onChangeWidth?: (width: number) => void;
};

/**
 * top level media nav sidebar.
 */
export function MediaTree({
  path,
  loading,
  onClickMedia,
  onDoubleClickMedia,
  children,
  width,
  onChangeWidth,
  ...props
}: MediaTreeProps) {
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
    <Resizable
      asChild
      direction="x"
      size={{ width }}
      min={{ width: 280 }}
      max={{ width: 500 }}
      onResize={(size) => onChangeWidth?.(size.width)}
      disabled={!onChangeWidth}
    >
      <Row className={styles.MediaTree} style={{ width }}>
        <Nav
          style={{ height: "100%", width: "100%", boxSizing: "border-box" }}
          loading={childrenQuery.isLoading || loading}
          {...props}
        >
          {childrenQuery.isError ? (
            <Col flex={1} alignY="center">
              <ErrorState
                size="m"
                title={extractErrorMessage(childrenQuery.error)}
              />
            </Col>
          ) : !childrenQuery.data?.items.length ? (
            <Col flex={1} alignY="center">
              <EmptySearch size="m" title="Sem resultados" />
            </Col>
          ) : (
            childrenQuery.data?.items.map((entry) => (
              <MediaTreeNode
                path={path}
                key={entry.id}
                entry={entry}
                onClickMedia={onClickMedia}
                onDoubleClickMedia={onDoubleClickMedia}
              />
            ))
          )}

          {children}
        </Nav>
      </Row>
    </Resizable>
  );
}

export function MediaTreeNode({
  entry,
  onClickMedia,
  onDoubleClickMedia,
}: {
  path?: Path;
  entry: Media;
  onClickMedia?: (entry: Media) => void;
  onDoubleClickMedia?: (entry: Media) => void;
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
      onClick={() => onClickMedia?.(entry)}
      onDoubleClick={() => onDoubleClickMedia?.(entry)}
    >
      {childrenQuery.data?.items.map((entry) => (
        <MediaTreeNode
          key={entry.id}
          entry={entry}
          onClickMedia={() => onClickMedia?.(entry)}
          onDoubleClickMedia={() => onDoubleClickMedia?.(entry)}
        />
      ))}
    </Nav.Button>
  );
}
