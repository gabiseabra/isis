import { ID } from "@isis/common/utils/id";
import { sqlOne, sqlOneMaybe } from "../../db/sql";

class DraftBookMetadataRow {
  constructor(
    public book_id: number | null,
    public sheet_id: number,
    public row_id: number,
    public deleted_at: Date | null,
    public applied_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapDraftBookMetadata(row: DraftBookMetadataRow) {
  return {
    bookId: row.book_id ? ID.create("Book", row.book_id) : undefined,
    sheetId: ID.create("Sheet", row.sheet_id),
    rowId: row.row_id,
    deletedAt: row.deleted_at ? row.deleted_at : undefined,
    appliedAt: row.applied_at ? row.applied_at : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveDraftBookMetadata(bookId: ID<"Book">) {
  const row = await sqlOneMaybe<DraftBookMetadataRow>`
  todo
  `;
  return row ? mapDraftBookMetadata(row) : null;
}

export async function getDraftBookMetadata(
  sheetId?: ID<"Sheet">,
  rowId?: number,
) {
  const row = await sqlOneMaybe<DraftBookMetadataRow>`
  todo
  `;
  return row ? mapDraftBookMetadata(row) : null;
}

export async function upsertDraftBookMetadata(input: {
  bookId?: ID<"Book">;
  sheetId: ID<"Sheet">;
  rowId: number;
  deletedAt?: Date;
  appliedAt?: Date;
}) {
  const row = await sqlOne<DraftBookMetadataRow>`
    todo
    `;
  return mapDraftBookMetadata(row);
}
