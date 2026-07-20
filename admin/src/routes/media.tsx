import { Path } from "@isis/common/dto/path";
import { Card } from "@isis/ui/layout/Card";
import { useNavigate, useParams } from "react-router";
import { MediaChildren } from "../components/media/MediaChildren";
import { MediaNav } from "../components/media/MediaNav";

export const path = "/media/*";

export function Component() {
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
      <MediaNav
        path={path}
        onClickMedia={(media) => {
          navigate(`/media/${media.path ?? ""}`);
        }}
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
