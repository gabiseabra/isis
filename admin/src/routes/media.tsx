import { Path } from "@isis/common/dto/path";
import { Divider } from "@isis/ui/display/Divider";
import { Card } from "@isis/ui/layout/Card";
import { Col } from "@isis/ui/layout/FlexBox";
import { useNavigate, useParams } from "react-router";
import { useLocalStorage } from "usehooks-ts";
import { MediaChildren } from "../components/media/MediaChildren";
import { MediaControls } from "../components/media/MediaControls";
import { MediaMetadata } from "../components/media/MediaMetadata";
import { MediaTree } from "../components/media/MediaTree";

export const path = "/media/*";

const MEDIA_NAV_WIDTH_KEY = "isis-media-nav-width";

export function Component() {
  const [navWidth, setNavWidth] = useLocalStorage<number | undefined>(
    MEDIA_NAV_WIDTH_KEY,
    undefined,
  );
  const path = Path.fromString(useParams()["*"] ?? "");
  const navigate = useNavigate();

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

            <Divider direction="x" />
          </Col>
        }
        footer={
          <Col gap={1}>
            <Divider direction="x" />

            <MediaControls path={path} />
          </Col>
        }
      />

      <MediaChildren
        p={2}
        path={path}
        onDoubleClickMedia={(media) => {
          console.log(media);
          if (media.metadata.type === "folder") {
            navigate(`/media/${media.path}`);
          }
        }}
      />
    </Card>
  );
}
