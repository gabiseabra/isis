import { Media } from "@isis/common/dto/media";
import { MediaInput } from "@isis/common/dto/media/input";
import { Path } from "@isis/common/dto/path";
import { never } from "@isis/common/utils/error";
import { JobQueue } from "../runtime/job-queue";

export const MediaJobQueue = new JobQueue("Media", {
  upload(
    input: MediaInput & {
      filePath: Path;
    },
  ): Media {
    never("not implemented");
  },
});
