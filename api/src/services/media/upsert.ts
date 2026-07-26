import { Media } from "@isis/common/dto/media";
import { MediaInput } from "@isis/common/dto/media/input";
import { createErrorHandler, never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { DatabaseError } from "pg";
import { unit } from "../../db/unit";
import { slugify } from "../../utils/slugify";
import {
  addMediaMetadata,
  createMediaEntry,
  getMediaMetadata,
  getMediaParentIds,
  removeMediaMetadata,
  updateMediaEntry,
} from "./db";
import { MediaInputUnprocessable, MediaNotFound } from "./errors";

export async function upsertMedia({
  id,
  metadata: rawMetadata,
  ..._input
}: MediaInput & {
  id?: ID<"Media">;
}): Promise<Media> {
  return unit(async () => {
    const input = {
      slug: slugify(_input.name),
      ..._input,
    };

    const media =
      (await (
        id ? updateMediaEntry({ id, ...input }) : createMediaEntry(input)
      ).catch(
        createErrorHandler().catch(DatabaseError, (error) => {
          if (error.constraint === "media_entries_path_unique")
            return never(
              new MediaInputUnprocessable(
                `Já existe um arquivo chamado "${input.slug}"`,
              ),
            );
          return never(new MediaInputUnprocessable());
        }),
      )) ?? never(new MediaNotFound());

    await removeMediaMetadata(media.id);
    const metadataEntries = Object.entries(rawMetadata).map(([key, value]) => ({
      key,
      value,
    }));
    if (NonEmpty.isNonEmpty(metadataEntries)) {
      await addMediaMetadata(media.id, metadataEntries);
    }

    const [parentIds, metadata] = await Promise.all([
      await getMediaParentIds(media.id),
      getMediaMetadata(media.id),
    ]);

    delete media.parentId;

    return {
      ...media,
      parentIds,
      metadata,
    };
  });
}
