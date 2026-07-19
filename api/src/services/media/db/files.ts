import { MediaFile, MediaVisibility } from "@isis/common/dto/media";
import { ID } from "@isis/common/utils/id";
import { sqlOne, sqlOneMaybe } from "../../../db/sql";

class MediaFileRow {
  constructor(
    public id: number,
    public folder_id: number,
    public visibility: MediaVisibility,
    public name: string,
    public original_name: string,
    public description: string | null,
    public tags: string[],
    public storage_key: string,
    public mime_type: string,
    public size_bytes: number,
    public deleted_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapMediaFile(row: MediaFileRow): MediaFile {
  return {
    id: ID.create("MediaFile", row.id),
    folderId: ID.create("MediaFolder", row.folder_id),
    visibility: row.visibility,
    name: row.name,
    originalName: row.original_name,
    description: row.description ?? undefined,
    tags: row.tags,
    storageKey: row.storage_key,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/// queries

export async function getMediaFile(id: ID<"MediaFile">) {
  const row = await sqlOneMaybe<MediaFileRow>`
    select * from media_files
    where id = ${ID.parse(id).id};
  `;

  return row ? mapMediaFile(row) : null;
}

/// mutations

type MediaFileRowInput = {
  folderId: ID<"MediaFolder">;
  visibility: MediaVisibility;
  name: string;
  originalName: string;
  description?: string;
  tags?: string[];
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  deletedAt?: Date;
};

export async function createMediaFile(input: MediaFileRowInput) {
  const row = await sqlOne<MediaFileRow>`
    insert into media_files (
      folder_id,
      visibility,
      name,
      original_name,
      description,
      tags,
      storage_key,
      mime_type,
      size_bytes,
      deleted_at
    )
    values (
      ${ID.parse(input.folderId).id},
      ${input.visibility}::media_visibility,
      ${input.name},
      ${input.originalName},
      ${input.description ?? null},
      ${input.tags ?? []},
      ${input.storageKey},
      ${input.mimeType},
      ${input.sizeBytes},
      ${(input.deletedAt ?? null) as Date}
    )
    returning *;
  `;

  return mapMediaFile(row);
}

export async function updateMediaFile(
  input: Partial<MediaFileRowInput> & {
    id: ID<"MediaFile">;
  },
) {
  const row = await sqlOne<MediaFileRow>`
    update media_files
    set folder_id = case when ${!("folderId" in input)} then folder_id else ${"folderId" in input ? ID.parse(input.folderId as ID<"MediaFolder">).id : null} end,
      visibility = case when ${!("visibility" in input)} then visibility else ${input.visibility ?? null}::media_visibility end,
      name = case when ${!("name" in input)} then name else ${input.name ?? null} end,
      original_name = case when ${!("originalName" in input)} then original_name else ${input.originalName ?? null} end,
      description = case when ${!("description" in input)} then description else ${input.description ?? null} end,
      tags = case when ${!("tags" in input)} then tags else ${(input.tags ?? null) as string[]} end,
      storage_key = case when ${!("storageKey" in input)} then storage_key else ${input.storageKey ?? null} end,
      mime_type = case when ${!("mimeType" in input)} then mime_type else ${input.mimeType ?? null} end,
      size_bytes = case when ${!("sizeBytes" in input)} then size_bytes else ${input.sizeBytes ?? null} end,
      deleted_at = case when ${!("deletedAt" in input)} then deleted_at else ${(input.deletedAt ?? null) as Date} end,
      updated_at = now()
    where id = ${ID.parse(input.id).id}
      and deleted_at is null
    returning *;
  `;

  return mapMediaFile(row);
}
