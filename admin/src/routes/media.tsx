import { Path } from "@isis/common/dto/path";
import { Divider } from "@isis/ui/display/Divider";
import { Card } from "@isis/ui/layout/Card";
import { Col } from "@isis/ui/layout/FlexBox";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useLocalStorage } from "usehooks-ts";
import { MediaChildren } from "../components/media/MediaChildren";
import { MediaControls } from "../components/media/MediaControls";
import { MediaMetadata } from "../components/media/MediaMetadata";
import { MediaTree } from "../components/media/MediaTree";
import { orpcQuery } from "../orpc/client";

export const path = "/media/*";

const MEDIA_NAV_WIDTH_KEY = "isis-media-nav-width";

export function Component() {
  const [navWidth, setNavWidth] = useLocalStorage<number | undefined>(
    MEDIA_NAV_WIDTH_KEY,
    undefined,
  );
  const path = Path.fromString(useParams()["*"] ?? "");
  const [activePath, setActivePath] = useState(path);
  const navigate = useNavigate();
  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({
      input: path ? { path } : skipToken,
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

      <MediaChildren
        p={2}
        rootId={entryQuery.data?.id}
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
    </Card>
  );
}
