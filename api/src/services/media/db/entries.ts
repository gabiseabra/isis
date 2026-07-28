import { LTree, Path } from "@isis/common/dto/path";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne, sqlOneMaybe } from "../../../db/sql";

class MediaEntryRow {
  constructor(
    public id: number,
    public parent_id: number | null,
    public name: string,
    public slug: string,
    public path: LTree,
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
    path: Path.fromLTreeString(row.path),
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
  input: { id: ID<"Media"> } | { path: Path },
) {
  const id = "id" in input ? ID.parse(input.id).id : null;
  const path = "path" in input ? Path.toLTree(input.path) : null;

  const row = await sqlOneMaybe<MediaEntryRow>`
    select *
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
  parentId?: ID<"Media">;
  path?: Path;
  limit?: number;
  offset?: number;
  query?: string;
  ids?: ID<"Media">[];
  tags?: string[];
  sort?: "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const rootId = input.rootId ? ID.parse(input.rootId).id : null;
  const parentId = input.parentId ? ID.parse(input.parentId).id : null;
  const hasParentId = "parentId" in input;
  const rootPath = input.path ?? null;
  const rootLTree: string | null = rootPath ? Path.toLTree(rootPath) : null;
  const ids = input.ids?.map((id) => ID.parse(id).id) ?? null;
  const query = input.query ?? null;
  const sort = input.sort ?? "name";
  const order = input.order ?? "asc";

  const rows = await sql<MediaEntryRow>`
    select media_entries.*
    from media_entries
    left join media_entries root on root.id = ${rootId} or root.path = ${rootLTree}::ltree
    left join lateral (
      select jsonb_object_agg(media_metadata.name, media_metadata.value) as metadata
      from media_metadata
      where media_metadata.entry_id = media_entries.id
    ) media_query on true
    where (
        (${rootLTree}::ltree is not null
          and media_entries.path <@ ${rootLTree}::ltree
          and media_entries.path <> ${rootLTree}::ltree)
        or
        (${rootLTree}::ltree is null
          and (${rootId}::bigint is null
            or (media_entries.path <@ root.path and media_entries.id <> root.id)))
      )
      and (${!hasParentId} or media_entries.parent_id is not distinct from ${parentId}::bigint)
      and media_entries.id = any(coalesce(${ids as number[]}::bigint[], array[media_entries.id]))
      and case
        when ${query}::text is null then true
        else jsonb_query_match(
          coalesce(media_query.metadata, '{}'::jsonb) || jsonb_build_object(
            'name', media_entries.name,
            'slug', media_entries.slug,
            'path', ltree_to_string(media_entries.path),
            'parent_path', ltree_to_string(subpath(media_entries.path, 0, -1))
          ),
          ${query}
        )
      end
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
    limit ${input.limit ?? null}
    offset ${input.offset ?? 0};
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
    returning *;
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
    returning *;
  `;

  return row ? mapMediaEntry(row) : null;
}
