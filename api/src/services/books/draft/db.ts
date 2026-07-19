import { ID } from "@isis/common/utils/id";
import { sqlOne, sqlOneMaybe } from "../../../db/sql";

class DraftBookMetadataRow {
  constructor(
    public sheet_id: number,
    public book_id: number,
    public row_id: number,
    public deleted_at: Date | null,
    public applied_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapDraftBookMetadata(row: DraftBookMetadataRow) {
  return {
    bookId: ID.create("Book", row.book_id),
    sheetId: ID.create("Sheet", row.sheet_id),
    rowId: row.row_id,
    deletedAt: row.deleted_at,
    appliedAt: row.applied_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getDraftBookMetadata(
  bookId: ID<"Book">,
  sheetId?: ID<"Sheet">,
  rowId?: number,
) {
  const row = await sqlOneMaybe<DraftBookMetadataRow>`
    select * from book_drafts
    where book_id = ${ID.parse(bookId).id}
      and sheet_id = coalesce(${sheetId ? ID.parse(sheetId).id : null}::bigint, sheet_id)
      and case when ${rowId ?? null}::bigint is null
          then applied_at is null and deleted_at is null
          else row_id = ${rowId ?? null}
          end
  `;
  return row ? mapDraftBookMetadata(row) : null;
}

export async function upsertDraftBookMetadata(input: {
  bookId: ID<"Book">;
  sheetId: ID<"Sheet">;
  rowId: number;
  deletedAt?: Date;
  appliedAt?: Date;
}) {
  const row = await sqlOne<DraftBookMetadataRow>`
    insert into book_drafts (book_id, sheet_id, row_id, deleted_at, applied_at)
    values (
      ${ID.parse(input.bookId).id},
      ${ID.parse(input.sheetId).id},
      ${input.rowId},
      ${(input.deletedAt ?? null) as Date},
      ${(input.appliedAt ?? null) as Date}
    )
    on conflict (book_id, row_id) do update
    set sheet_id = excluded.sheet_id,
      deleted_at = excluded.deleted_at,
      applied_at = excluded.applied_at,
      updated_at = now()
    returning *;
    `;
  return mapDraftBookMetadata(row);
}
