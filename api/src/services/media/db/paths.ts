import { MediaEdges, MediaEntryID } from "@isis/common/dto/media";
import { ID } from "@isis/common/utils/id";

class MediaEntryRow {
  constructor(
    public folder_id: number,
    public entry_type: "folder" | "file",
    public entry_id: number,
  ) {}
}

export function queryMediaPaths(input: {
  folderId?: ID<"MediaFolder">;
  limit?: number;
  offset?: number;
  /** like match on entry file/folder name and tags */
  query?: string;
  /** exact match on entry tags */
  tags?: string[];
  sort?: "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}): MediaEntryID[] {
  // todo
}
