import { MediaFolder } from "@isis/common/dto/media";
import { ID } from "@isis/common/utils/id";
import { sqlOne, sqlOneMaybe } from "../../../db/sql";

class MediaFolderRow {
  constructor(
    public id: number,
    public parent_id: number | null,
    public hidden: boolean,
    public name: string,
    public tags: string[],
    public deleted_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapMediaFolder(row: MediaFolderRow): MediaFolder {
  return {
    id: ID.create("MediaFolder", row.id),
    parentId:
      row.parent_id !== null
        ? ID.create("MediaFolder", row.parent_id)
        : undefined,
    hidden: row.hidden,
    name: row.name,
    tags: row.tags,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/// queries

export async function getMediaFolder(
  id: ID<"MediaFolder">,
  options?: { includeDeleted?: boolean },
) {
  const row = await sqlOneMaybe<MediaFolderRow>`
    select * from media_folders
    where id = ${ID.parse(id).id}
      and (${options?.includeDeleted ?? false}::boolean or deleted_at is null);
  `;

  return row ? mapMediaFolder(row) : null;
}

/// mutations

type MediaFolderRowInput = {
  parentId?: ID<"MediaFolder">;
  hidden: boolean;
  name: string;
  tags: string[];
  deletedAt?: Date;
};

export async function createMediaFolder(input: MediaFolderRowInput) {
  const row = await sqlOne<MediaFolderRow>`
    insert into media_folders (
      parent_id,
      hidden,
      name,
      tags,
      deleted_at
    )
    values (
      ${input.parentId ? ID.parse(input.parentId).id : null},
      ${input.hidden},
      ${input.name},
      ${input.tags},
      ${(input.deletedAt ?? null) as Date}
    )
    returning *;
  `;

  return mapMediaFolder(row);
}

export async function updateMediaFolder(
  input: Partial<MediaFolderRowInput> & {
    id: ID<"MediaFolder">;
  },
) {
  const row = await sqlOne<MediaFolderRow>`
    update media_folders
    set parent_id = case when ${!("parentId" in input)} then parent_id else ${input.parentId ? ID.parse(input.parentId).id : null} end,
      hidden = case when ${!("hidden" in input)} then hidden else ${input.hidden ?? null} end,
      name = case when ${!("name" in input)} then name else ${input.name ?? null} end,
      tags = case when ${!("tags" in input)} then tags else ${input.tags ?? []} end,
      deleted_at = case when ${!("deletedAt" in input)} then deleted_at else ${(input.deletedAt ?? null) as Date} end,
      updated_at = now()
    where id = ${ID.parse(input.id).id}
      and deleted_at is null
    returning *;
  `;

  return mapMediaFolder(row);
}
