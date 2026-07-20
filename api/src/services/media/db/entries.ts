import { ID } from "@isis/common/utils/id";
import { sql, sqlOne, sqlOneMaybe } from "../../../db/sql";

class MediaEntryRow {
  constructor(
    public id: number,
    public parent_id: number | null,
    public name: string,
    public slug: string,
    public path: string | null,
    public tags: string[],
    public deleted_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapMediaEntry(row: MediaEntryRow) {
  return {
    id: ID.create("Media", row.id),
    parentId: row.parent_id ? ID.create("Media", row.parent_id) : undefined,
    path: row.path ?? "",
    name: row.name,
    slug: row.slug,
    tags: row.tags,
    deletedAt: row.deleted_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/// queries

export async function getMediaEntry(
  input: ID<"Media"> | { id: ID<"Media"> } | { path: string },
) {
  const id =
    typeof input === "string"
      ? ID.parse(input).id
      : "id" in input
        ? ID.parse(input.id).id
        : null;
  const path = typeof input === "object" && "path" in input ? input.path : null;

  const row = await sqlOneMaybe<MediaEntryRow>`
    select id, parent_id, name, slug, (path::text || '') as path, tags, deleted_at, created_at, updated_at
    from media_entries
    where (id = ${id} or path = ${path}::ltree)
      and deleted_at is null;
  `;

  return row ? mapMediaEntry(row) : null;
}

export async function getMediaParentIds(id: ID<"Media">) {
  const row = await sqlOneMaybe<{ parent_ids: number[] }>`
    select coalesce(array_agg(parent.id order by nlevel(parent.path)), array[]::bigint[]) as parent_ids
    from media_entries media
    join media_entries parent on parent.path @> media.path
      and parent.id <> media.id
      and parent.deleted_at is null
    where media.id = ${ID.parse(id).id}
      and media.deleted_at is null;
  `;

  return row?.parent_ids.map((id) => ID.create("Media", id)) ?? [];
}

export async function queryMediaEntry(input: {
  rootId?: ID<"Media">;
  path?: string;
  limit: number;
  offset: number;
  query?: string;
  ids?: ID<"Media">[];
  tags?: string[];
  sort?: "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const rootId = input.rootId ? ID.parse(input.rootId).id : null;
  const rootPath = input.path ?? null;
  const ids = input.ids?.map((id) => ID.parse(id).id) ?? null;
  const sort = input.sort ?? "name";
  const order = input.order ?? "asc";

  const rows = await sql<MediaEntryRow>`
    select media_entries.id, media_entries.parent_id, media_entries.name, media_entries.slug, (media_entries.path::text || '') as path, media_entries.tags, media_entries.deleted_at, media_entries.created_at, media_entries.updated_at
    from media_entries
    left join media_entries root on root.id = ${rootId} or root.path = ${rootPath}::ltree
    where (
        (${rootPath}::ltree is not null
          and media_entries.path <@ ${rootPath}::ltree
          and media_entries.path <> ${rootPath}::ltree)
        or
        (${rootPath}::ltree is null
          and (${rootId}::bigint is null
            or (media_entries.path <@ root.path and media_entries.id <> root.id)))
      )
      and media_entries.id = any(coalesce(${ids as number[]}::bigint[], array[media_entries.id]))
      and concat_ws(' ', media_entries.name, media_entries.slug, media_entries.path::text, array_to_string(media_entries.tags, ' ')) ilike coalesce('%' || ${input.query ?? null} || '%', '%')
      and media_entries.tags @> coalesce(${(input.tags ?? null) as string[]}::text[], array[]::text[])
      and media_entries.deleted_at is null
    order by
      case when ${sort} = 'name' and ${order} = 'asc' then media_entries.name end asc,
      case when ${sort} = 'name' and ${order} = 'desc' then media_entries.name end desc,
      case when ${sort} = 'created_at' and ${order} = 'asc' then media_entries.created_at end asc,
      case when ${sort} = 'created_at' and ${order} = 'desc' then media_entries.created_at end desc,
      case when ${sort} = 'updated_at' and ${order} = 'asc' then media_entries.updated_at end asc,
      case when ${sort} = 'updated_at' and ${order} = 'desc' then media_entries.updated_at end desc,
      media_entries.id asc
    limit ${input.limit}
    offset ${input.offset};
  `;

  return rows.map(mapMediaEntry);
}

export async function queryMediaEntryChildren(input: {
  rootId?: ID<"Media">;
  path?: string;
  limit: number;
  offset: number;
  query?: string;
  tags?: string[];
  sort?: "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const rootId = input.rootId ? ID.parse(input.rootId).id : null;
  const rootPath = input.path ?? null;
  const sort = input.sort ?? "name";
  const order = input.order ?? "asc";

  const rows = await sql<MediaEntryRow>`
    select id, parent_id, name, slug, (path::text || '') as path, tags, deleted_at, created_at, updated_at
    from media_entries
    where (
        (${rootPath}::ltree is null and parent_id is not distinct from ${rootId}::bigint)
        or (${rootPath}::ltree is not null and path <@ ${rootPath}::ltree and nlevel(path) = nlevel(${rootPath}::ltree) + 1)
      )
      and concat_ws(' ', name, slug, path::text, array_to_string(tags, ' ')) ilike coalesce('%' || ${input.query ?? null} || '%', '%')
      and tags @> coalesce(${(input.tags ?? null) as string[]}::text[], array[]::text[])
      and deleted_at is null
    order by
      case when ${sort} = 'name' and ${order} = 'asc' then name end asc,
      case when ${sort} = 'name' and ${order} = 'desc' then name end desc,
      case when ${sort} = 'created_at' and ${order} = 'asc' then created_at end asc,
      case when ${sort} = 'created_at' and ${order} = 'desc' then created_at end desc,
      case when ${sort} = 'updated_at' and ${order} = 'asc' then updated_at end asc,
      case when ${sort} = 'updated_at' and ${order} = 'desc' then updated_at end desc,
      id asc
    limit ${input.limit}
    offset ${input.offset};
  `;

  return rows.map(mapMediaEntry);
}

/// mutations

type MediaRowInput = {
  parentId?: ID<"Media">;
  name: string;
  slug: string;
  tags: string[];
  deletedAt?: Date;
};

export async function createMediaEntry(input: MediaRowInput) {
  const row = await sqlOne<MediaEntryRow>`
    insert into media_entries (
      parent_id,
      name,
      slug,
      tags,
      deleted_at
    )
    values (
      ${input.parentId ? ID.parse(input.parentId).id : null},
      ${input.name},
      ${input.slug},
      ${input.tags},
      ${(input.deletedAt ?? null) as Date}
    )
    returning id, parent_id, name, slug, (path::text || '') as path, tags, deleted_at, created_at, updated_at;
  `;

  return mapMediaEntry(row);
}

export async function updateMediaEntry(
  input: Partial<MediaRowInput> & {
    id: ID<"Media">;
  },
) {
  const row = await sqlOneMaybe<MediaEntryRow>`
    update media_entries
    set parent_id = case when ${!("parentId" in input)} then parent_id else ${input.parentId ? ID.parse(input.parentId).id : null} end,
      name = case when ${!("name" in input)} then name else ${input.name ?? null} end,
      slug = case when ${!("slug" in input)} then slug else ${input.slug ?? null} end,
      tags = case when ${!("tags" in input)} then tags else ${(input.tags ?? null) as string[]}::text[] end,
      deleted_at = case when ${!("deletedAt" in input)} then deleted_at else ${(input.deletedAt ?? null) as Date} end,
      updated_at = now()
    where id = ${ID.parse(input.id).id}
      and deleted_at is null
    returning id, parent_id, name, slug, (path::text || '') as path, tags, deleted_at, created_at, updated_at;
  `;

  return row ? mapMediaEntry(row) : null;
}
