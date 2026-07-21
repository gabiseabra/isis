import { MediaInput } from "@isis/common/dto/media/input";
import { UUID } from "@isis/common/dto/uuid";
import { slugify } from "../../utils/slugify";
import { uploadHetznerFile } from "../hetzner/upload";
import { MediaInputUnprocessable } from "./errors";
import { upsertMedia } from "./upsert";

export async function uploadMedia({
  file,
  ..._input
}: Partial<MediaInput> & { file: File }) {
  const extension = file.name.match(/\.[^./\\]+$/)?.[0] ?? "";

  return upsertMedia({
    name: file.name,
    slug: slugify(file.name),
    tags: [],
    ..._input,
    metadata: {
      ..._input.metadata,
      type: "file",
      fileName: file.name,
      fileExtension: extension,
      fileType: file.type,
      fileSize: file.size,
      storageKey: await uploadHetznerFile(
        file,
        [
          process.env.HETZNER_OBJECT_STORAGE_PREFIX ?? "media",
          `${slugify(file.name)}-${UUID.create()}${extension}`,
        ].join("/"),
      ).catch((error) => {
        throw new MediaInputUnprocessable(
          error instanceof Error ? error.message : undefined,
        );
      }),
    },
  });
}
