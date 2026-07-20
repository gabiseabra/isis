import { Media } from "@isis/common/dto/media";
import { MediaInput } from "@isis/common/dto/media/input";
import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { unit } from "../../db/unit";
import {
  addMediaMetadata,
  createMediaEntry,
  getMediaParentIds,
  removeMediaMetadata,
  updateMediaEntry,
} from "./db";

export async function upsertMedia({
  id,
  metadata,
  ...input
}: MediaInput & {
  id?: ID<"Media">;
}): Promise<Media> {
  return unit(async () => {
    const media = await (id
      ? updateMediaEntry({ id, ...input })
      : createMediaEntry(input));

    await removeMediaMetadata(media.id);
    const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
      key,
      value,
    }));
    if (NonEmpty.isNonEmpty(metadataEntries)) {
      await addMediaMetadata(media.id, metadataEntries);
    }

    delete media.parentId;

    return {
      ...media,
      parentIds: await getMediaParentIds(media.id),
      metadata,
    };
  });
}
