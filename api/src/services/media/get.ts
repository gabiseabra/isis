import { Media } from "@isis/common/dto/media";
import { ID } from "@isis/common/utils/id";
import { getMediaEntry, getMediaMetadata, getMediaParentIds } from "./db";

export async function getMedia(id: ID<"Media">): Promise<Media | null> {
  const [entry, metadata, parentIds] = await Promise.all([
    getMediaEntry(id),
    getMediaMetadata(id),
    getMediaParentIds(id),
  ]);

  if (!entry) return null;

  delete entry.parentId;

  return {
    ...entry,
    metadata,
    parentIds,
  };
}
