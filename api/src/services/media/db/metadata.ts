import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { sql } from "../../../db/sql";

class MediaMetadataRow {
  constructor(
    public name: string,
    public value: unknown,
  ) {}
}

/// queries

export async function getMediaMetadata(mediaId: ID<"Media">) {
  const rows = await sql<MediaMetadataRow>`
    select name, value from media_metadata
    where entry_id = ${ID.parse(mediaId).id};
  `;

  return Object.fromEntries(rows.map((row) => [row.name, row.value] as const));
}

/// relations: media

export async function removeMediaMetadata(
  mediaId: ID<"Media">,
  keysToDelete?: string[],
) {
  await sql`
    delete from media_metadata
    where entry_id = ${ID.parse(mediaId).id}
      and name = any(coalesce(${(keysToDelete ?? null) as string[]}::varchar[], array[name]));
  `;
}

export async function addMediaMetadata(
  mediaId: ID<"Media">,
  entries: NonEmpty<{ key: string; value: unknown }>,
) {
  await sql`
    insert into media_metadata (entry_id, name, value)
    select ${ID.parse(mediaId).id}, metadata.key, metadata.value
    from jsonb_to_recordset(${JSON.stringify(entries)}::jsonb)
      as metadata(key varchar(255), value jsonb)
    on conflict (entry_id, name) do update
    set value = excluded.value;
  `;
}
