import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { Divider } from "@isis/ui/display/Divider";
import { ErrorState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Card } from "@isis/ui/layout/Card";
import { Col, FlexBox } from "@isis/ui/layout/FlexBox";
import { Resizable } from "@isis/ui/layout/Resizable";
import { useLocalStorage, useResizeObserver } from "@mantine/hooks";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Size } from "../../../ui/src/layout/use-resizer";
import { MediaChildren } from "../components/media/MediaChildren";
import { MediaControls } from "../components/media/MediaControls";
import { MediaMetadata } from "../components/media/MediaMetadata";
import { MediaPreview } from "../components/media/MediaPreview";
import { MediaTree } from "../components/media/MediaTree";
import { orpcQuery } from "../orpc/client";

export const path = "/media/*";

const MEDIA_NAV_WIDTH_KEY = "isis-media-nav-width";

export function Component() {
  const [viewRef, viewRect] = useResizeObserver();
  const [navWidth, setNavWidth] = useLocalStorage<number | undefined>({
    key: MEDIA_NAV_WIDTH_KEY,
    defaultValue: undefined,
  });
  const path = Path.fromString(useParams()["*"] ?? "");
  const [activePath, setActivePath] = useState(path);
  const navigate = useNavigate();
  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({
      input: path ? { path } : skipToken,
    }),
  );
  const activeEntryQuery = useQuery(
    orpcQuery.media.get.queryOptions({
      input: activePath ? { path: activePath } : skipToken,
    }),
  );

  return (
    <Card
      flex={1}
      direction="inline"
      width="auto"
      elevation={2}
      my={3}
      style={{ overflow: "auto", background: "var(--color-surface-1)" }}
    >
      <MediaTree
        path={path}
        width={navWidth}
        onChangeWidth={setNavWidth}
        onDoubleClickMedia={(media) => {
          setActivePath(path);
          navigate(`/media/${media.path}`);
        }}
        header={
          <Col gap={1}>
            <MediaMetadata
              path={path}
              onGoBack={() => {
                setActivePath(Path.parent(path));
                navigate(`/media/${Path.parent(path)}`);
              }}
            />

            <Divider />
          </Col>
        }
        footer={
          <Col gap={1}>
            <Divider />

            <MediaControls path={path} />
          </Col>
        }
      />

      <FlexBox
        ref={viewRef}
        direction={viewRect && viewRect.width > 500 ? "inline" : "block"}
      >
        {entryQuery.isPending || activeEntryQuery.isPending ? (
          <Spinner size="m" />
        ) : (
          <>
            {entryQuery.isError ? (
              <ErrorState title={extractErrorMessage(entryQuery.error)} />
            ) : activeEntryQuery.isError ? (
              <ErrorState title={extractErrorMessage(activeEntryQuery.error)} />
            ) : null}

            <MediaChildren
              p={2}
              mediaId={entryQuery.data?.id}
              activePath={activePath}
              onClickMedia={(media) => {
                setActivePath(media.path);
              }}
              onDoubleClickMedia={(media) => {
                if (media.metadata.type === "folder") {
                  setActivePath(media.path);
                  navigate(`/media/${media.path}`);
                }
              }}
            />

            <Resizable>{/* <MediaPreview mediaId={} /> */}</Resizable>
          </>
        )}
      </FlexBox>
    </Card>
  );
}
