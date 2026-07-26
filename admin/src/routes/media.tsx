import { Path } from "@isis/common/dto/path";
import { Divider } from "@isis/ui/display/Divider";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Card } from "@isis/ui/layout/Card";
import { Col, FlexBox } from "@isis/ui/layout/FlexBox";
import { Resizable } from "@isis/ui/layout/Resizable";
import { useLocalStorage } from "@mantine/hooks";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Size } from "../../../ui/src/layout/use-resizer";
import { MediaChildren } from "../components/media/MediaChildren";
import { MediaControls } from "../components/media/MediaControls";
import { MediaMetadata } from "../components/media/MediaMetadata";
import { MediaPreview } from "../components/media/MediaPreview";
import { MediaTree } from "../components/media/MediaTree";
import { orpcQuery } from "../orpc/client";

export const path = "/media/*";

const MEDIA_NAV_WIDTH_KEY = "isis-media-nav-width";
const MEDIA_PREVIEW_SIZE_KEY = "isis-media-preview-size";

export function Component() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [previewSize, setPreviewSize] = useLocalStorage<Size | undefined>({
    key: MEDIA_PREVIEW_SIZE_KEY,
    defaultValue: {
      height: 300,
      width: 250,
    },
  });
  const [navWidth, setNavWidth] = useLocalStorage<number | undefined>({
    key: MEDIA_NAV_WIDTH_KEY,
    defaultValue: undefined,
  });

  const path = Path.fromString(useParams()["*"] ?? "");
  const activeSlug = searchParams.get("file");
  const activePath = activeSlug ? Path.join([path, activeSlug]) : path;

  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({
      input: { path },
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
      gap={0}
      style={{ overflow: "auto", background: "var(--color-surface-1)" }}
    >
      <Resizable
        positions={["right"]}
        size={{ width: navWidth }}
        min={{ width: 200 }}
        max={{ width: 600 }}
        style={{
          height: "100%",
          borderRight: "1px solid var(--color-surface-1)",
        }}
        onResize={({ width }) => setNavWidth(width)}
        frame={(children) => (
          <Resizable.Frame style={{ zIndex: 1, margin: "-10px" }}>
            {children}
          </Resizable.Frame>
        )}
      >
        <MediaTree
          path={path}
          onDoubleClickMedia={(media) => {
            navigate(`/media/${media.path}`);
          }}
          header={
            <Col gap={1}>
              <MediaMetadata
                path={path}
                onGoBack={() => {
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
      </Resizable>

      <FlexBox
        gap={0}
        alignY="space-between"
        width="100%"
        height="100%"
        style={{ overflow: "hidden" }}
      >
        {path && entryQuery.isPending ? (
          <FlexBox flex={1} alignX="center" alignY="center">
            <Spinner size="m" />
          </FlexBox>
        ) : (
          <>
            <MediaChildren
              p={2}
              mediaId={entryQuery.data?.id}
              activePath={activePath}
              onClick={(e) => {
                console.log(e);
              }}
              onClickMedia={(media) => {
                const segments = Path.split(media.path);
                setSearchParams({ file: segments[segments.length - 1] ?? "" });
              }}
              onDoubleClickMedia={(media) => {
                if (media.metadata.type === "folder") {
                  navigate(`/media/${media.path}`);
                }
              }}
            />

            {activePath && activePath !== path && activeEntryQuery.data && (
              <Resizable
                positions={["top"]}
                size={previewSize}
                min={{ width: 200, height: 200 }}
                max={{ width: 600, height: 600 }}
                style={{ width: "100%" }}
                onResize={setPreviewSize}
                frame={(children) => (
                  <Resizable.Frame style={{ zIndex: 1, margin: "-10px" }}>
                    {children}
                  </Resizable.Frame>
                )}
              >
                <MediaPreview mediaId={activeEntryQuery.data.id} />
              </Resizable>
            )}
          </>
        )}
      </FlexBox>
    </Card>
  );
}
