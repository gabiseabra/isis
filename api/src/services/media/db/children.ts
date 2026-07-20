import { ID } from "@isis/common/utils/id";
import { sql } from "../../../db/sql";

class MediaChildRow {
  constructor(public id: number) {}
}

function mapMediaChild(row: MediaChildRow) {
  return ID.create("MediaEntry", row.id);
}

/// queries

export async function queryMediaChildren(input: {
  entryId?: ID<"MediaEntry">;
  limit?: number;
  offset?: number;
  /** like match on entry name, slug, path and tags */
  query?: string;
  /** exact match on entry tags */
  tags?: string[];
  sort?: "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const sort = input.sort ?? "name";
  const order = input.order ?? "asc";

  const rows = await sql<MediaChildRow>`
    select id from media_entries
    where parent_id is not distinct from ${input.entryId ? ID.parse(input.entryId).id : null}::bigint
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
    limit ${input.limit ?? null}
    offset ${input.offset ?? 0};
  `;

  return rows.map(mapMediaChild);
}
