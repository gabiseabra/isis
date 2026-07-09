import { SheetMetadata } from "@isis/common/dto/sheet";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne } from "../../../db/sql";

class SheetRow {
  constructor(
    public id: number,
    public file_name: string,
    public file_hash: string,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapSheet(row: SheetRow): SheetMetadata {
  return {
    id: ID.create("Sheet", row.id),
    fileName: row.file_name,
    fileHash: row.file_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSheet(id: ID<"Sheet">) {
  const row = await sqlOne<SheetRow>`
    select * from sheets
    where id = ${ID.parse(id).id};
    `;

  return mapSheet(row);
}

export async function querySheets(query: {
  offset: number;
  limit: number;
  query?: string;
  ids?: number[];
}) {
  const rows = await sql<SheetRow>`
    select * from sheets
    where concat_ws(' ', file_name, file_hash) ilike coalesce('%' || ${query.query ?? null} || '%', '%')
      and id = any(coalesce(${(query.ids ?? null) as number[]}::bigint[], array[id]))
    order by id asc
    limit ${query.limit}
    offset ${query.offset};
    `;

  return rows.map(mapSheet);
}

export async function createSheet(input: {
  fileName: string;
  fileHash: string;
}) {
  const row = await sqlOne<SheetRow>`
    insert into sheets (file_name, file_hash)
    values (${input.fileName}, ${input.fileHash})
    returning *;
    `;

  return mapSheet(row);
}
