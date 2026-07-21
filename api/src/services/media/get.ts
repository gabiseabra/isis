import { Media } from "@isis/common/dto/media";
import { ID } from "@isis/common/utils/id";
import { getMediaEntry, getMediaMetadata, getMediaParentIds } from "./db";

export async function getMedia(
  input: { id: ID<"Media"> } | { path: string },
): Promise<Media | null> {
  const entry = await getMediaEntry(input);

  if (!entry) return null;

  const [metadata, parentIds] = await Promise.all([
    getMediaMetadata(entry.id),
    getMediaParentIds(entry.id),
  ]);

  delete entry.parentId;

  return {
    ...entry,
    metadata,
    parentIds,
  };
}
