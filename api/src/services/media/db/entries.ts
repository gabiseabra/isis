import { MediaEntry } from "@isis/common/dto/media/entry";
import { MediaVisibility } from "@isis/common/dto/media/visibility";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne, sqlOneMaybe } from "../../../db/sql";

class MediaEntryRow {
  constructor(
    public id: number,
    public parent_id: number | null,
    public name: string,
    public slug: string,
    public path: string,
    public tags: string[],
    public visibility: MediaVisibility | null,
    public deleted_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapMediaEntry(row: MediaEntryRow): MediaEntry {
  return {
    id: ID.create("MediaEntry", row.id),
    parentId:
      row.parent_id !== null
        ? ID.create("MediaEntry", row.parent_id)
        : undefined,
    name: row.name,
    slug: row.slug,
    path: row.path,
    tags: row.tags,
    visibility: row.visibility ?? "private",
    deletedAt: row.deleted_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/// queries

export async function getMediaEntry(
  id: ID<"MediaEntry">,
  options?: { includeDeleted?: boolean },
) {
  const row = await sqlOneMaybe<MediaEntryRow>`
    select * from media_entries
    where id = ${ID.parse(id).id}
      and (${options?.includeDeleted ?? false}::boolean or deleted_at is null);
  `;

  return row ? mapMediaEntry(row) : null;
}

/** returns entries that match the query under an entry path */
export async function queryMediaEntries(input: {
  /** if given, only return descendants under this entry */
  entryId?: ID<"MediaEntry">;
  /** maximum number of entries to return */
  limit?: number;
  /** number of matching entries to skip */
  offset?: number;
  /** like match on entry name, slug, path and tags */
  query?: string;
  /** exact tag containment filter */
  tags?: string[];
  ids?: ID<"MediaEntry">[];
  visibility?: MediaVisibility;
  sort?: "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const entryId = input.entryId ? ID.parse(input.entryId).id : null;
  const ids = input.ids?.map((id) => ID.parse(id).id) ?? null;
  const sort = input.sort ?? "name";
  const order = input.order ?? "asc";

  const rows = await sql<MediaEntryRow>`
    select media_entries.*
    from media_entries
    left join media_entries parent on parent.id = ${entryId}
    where (${entryId}::bigint is null or (media_entries.path <@ parent.path and media_entries.id <> parent.id))
      and media_entries.id = any(coalesce(${ids as number[]}::bigint[], array[media_entries.id]))
      and concat_ws(' ', media_entries.name, media_entries.slug, media_entries.path::text, array_to_string(media_entries.tags, ' ')) ilike coalesce('%' || ${input.query ?? null} || '%', '%')
      and media_entries.tags @> coalesce(${(input.tags ?? null) as string[]}::text[], array[]::text[])
      and (${input.visibility ?? null}::media_visibility is null or media_entries.visibility = ${input.visibility ?? null}::media_visibility)
      and media_entries.deleted_at is null
    order by
      case when ${sort} = 'name' and ${order} = 'asc' then media_entries.name end asc,
      case when ${sort} = 'name' and ${order} = 'desc' then media_entries.name end desc,
      case when ${sort} = 'created_at' and ${order} = 'asc' then media_entries.created_at end asc,
      case when ${sort} = 'created_at' and ${order} = 'desc' then media_entries.created_at end desc,
      case when ${sort} = 'updated_at' and ${order} = 'asc' then media_entries.updated_at end asc,
      case when ${sort} = 'updated_at' and ${order} = 'desc' then media_entries.updated_at end desc,
      media_entries.id asc
    limit ${input.limit ?? null}
    offset ${input.offset ?? 0};
  `;

  return rows.map(mapMediaEntry);
}

/// mutations

type MediaEntryRowInput = {
  parentId?: ID<"MediaEntry">;
  name: string;
  slug: string;
  tags: string[];
  visibility?: MediaVisibility;
  deletedAt?: Date;
};

export async function createMediaEntry(input: MediaEntryRowInput) {
  const row = await sqlOne<MediaEntryRow>`
    insert into media_entries (
      parent_id,
      name,
      slug,
      tags,
      visibility,
      deleted_at
    )
    values (
      ${input.parentId ? ID.parse(input.parentId).id : null},
      ${input.name},
      ${input.slug},
      ${input.tags},
      ${input.visibility ?? null}::media_visibility,
      ${(input.deletedAt ?? null) as Date}
    )
    returning *;
  `;

  return mapMediaEntry(row);
}

export async function updateMediaEntry(
  input: Partial<MediaEntryRowInput> & {
    id: ID<"MediaEntry">;
  },
) {
  const row = await sqlOne<MediaEntryRow>`
    update media_entries
    set parent_id = case when ${!("parentId" in input)} then parent_id else ${input.parentId ? ID.parse(input.parentId).id : null} end,
      name = case when ${!("name" in input)} then name else ${input.name ?? null} end,
      slug = case when ${!("slug" in input)} then slug else ${input.slug ?? null} end,
      tags = case when ${!("tags" in input)} then tags else ${(input.tags ?? []) as string[]} end,
      visibility = case when ${!("visibility" in input)} then visibility else ${input.visibility ?? null}::media_visibility end,
      deleted_at = case when ${!("deletedAt" in input)} then deleted_at else ${(input.deletedAt ?? null) as Date} end,
      updated_at = now()
    where id = ${ID.parse(input.id).id}
      and deleted_at is null
    returning *;
  `;

  return mapMediaEntry(row);
}
