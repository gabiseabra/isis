import { MediaMetadata } from "@isis/common/dto/media/metadata";
import { ID } from "@isis/common/utils/id";
import { sql } from "../../../db/sql";

class MediaMetadataRow {
  constructor(
    public name: string,
    public value: unknown,
  ) {}
}

function mapMediaMetadata(rows: MediaMetadataRow[]) {
  return MediaMetadata.parse(
    Object.fromEntries(rows.map((row) => [row.name, row.value])),
  );
}

/// queries

export async function getMediaMetadata(entryId: ID<"MediaEntry">) {
  const rows = await sql<MediaMetadataRow>`
    select name, value from media_metadata
    where entry_id = ${ID.parse(entryId).id};
  `;

  return mapMediaMetadata(rows);
}

/// mutations

export async function upsertMediaMetadata(input: {
  entryId: ID<"MediaEntry">;
  metadata: MediaMetadata;
}) {
  const metadata = MediaMetadata.parse(input.metadata);

  await sql`
    insert into media_metadata (entry_id, name, value)
    select ${ID.parse(input.entryId).id}, metadata.name, metadata.value
    from jsonb_each(${JSON.stringify(metadata)}::jsonb) metadata(name, value)
    on conflict (entry_id, name) do update
    set value = excluded.value;
  `;

  return metadata;
}
