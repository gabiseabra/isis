import { ID } from "@isis/common/utils/id";
import { sql } from "../../../db/sql";

class MediaAncestorRow {
  constructor(public id: number) {}
}

function mapMediaAncestor(row: MediaAncestorRow) {
  return ID.create("MediaEntry", row.id);
}

/// queries

export async function getMediaAncestors(entryId: ID<"MediaEntry">) {
  const rows = await sql<MediaAncestorRow>`
    select ancestor.id
    from media_entries entry
    join media_entries ancestor on ancestor.path @> entry.path
      and ancestor.id <> entry.id
    where entry.id = ${ID.parse(entryId).id}
      and ancestor.deleted_at is null
    order by nlevel(ancestor.path) asc;
  `;

  return rows.map(mapMediaAncestor);
}
