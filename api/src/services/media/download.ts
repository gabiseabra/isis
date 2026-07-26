import { Path } from "@isis/common/dto/path";
import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { getHetznerFileUrl } from "../hetzner/file-url";
import { MediaNotFound } from "./errors";
import { getMedia } from "./get";

export const DOWNLOADABLE_FILE_TYPE_REGEXP = /^(application\/pdf$|image\/)/;

export async function downloadMedia(
  idOrPath: { id: ID<"Media"> } | { path: Path },
): Promise<File> {
  const media = (await getMedia(idOrPath)) ?? never(new MediaNotFound());

  if (
    media.metadata.type !== "file" ||
    !DOWNLOADABLE_FILE_TYPE_REGEXP.test(media.metadata.fileType)
  )
    throw new MediaNotFound();

  const response = await fetch(getHetznerFileUrl(media.metadata.storageKey));
  if (!response.ok) throw new Error(await response.text());

  return new File(
    [await response.blob()],
    media.metadata.fileName ?? media.name,
    {
      type: media.metadata.fileType,
    },
  );
}
