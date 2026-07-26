import { Media } from "@isis/common/dto/media";
import { MediaInput } from "@isis/common/dto/media/input";
import { Path } from "@isis/common/dto/path";
import { never } from "@isis/common/utils/error";
import { TaskQueue } from "../queues/task-queue";

export const MediaQueue = new TaskQueue("Media", {
  upload(
    input: MediaInput & {
      filePath: Path;
    },
  ): Media {
    never("not implemented");
  },
});
