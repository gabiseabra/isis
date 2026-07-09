import { SheetColumn } from "@isis/common/dto/sheet";
import { ID } from "@isis/common/utils/id";
import { sql, sqlOne } from "../../../db/sql";

class SheetColumnRow {
  constructor(
    public id: number,
    public sheet_id: number,
    public name: string,
    public tags: string[],
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapSheetColumn(row: SheetColumnRow): SheetColumn {
  return {
    sheetId: ID.create("Sheet", row.sheet_id),
    columnId: row.id,
    name: row.name,
    tags: row.tags,
  };
}

export async function getSheetColumn(sheetId: ID<"Sheet">, columnId: number) {
  const row = await sqlOne<SheetColumnRow>`
    select * from sheet_columns
    where sheet_id = ${ID.parse(sheetId).id}
      and id = ${columnId};
    `;

  return mapSheetColumn(row);
}

export async function querySheetColumns(input: {
  sheetId: ID<"Sheet">;
  offset: number;
  limit: number;
  ids?: number[];
  tags?: string[];
  sort?: "id" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const sort = input.sort ?? "id";
  const order = input.order ?? "asc";

  const rows = await sql<SheetColumnRow>`
    select * from sheet_columns
    where sheet_id = ${ID.parse(input.sheetId).id}
      and id = any(coalesce(${(input.ids ?? null) as number[]}::bigint[], array[id]))
      and tags @> coalesce(${(input.tags ?? null) as string[]}::text[], array[]::text[])
    order by
      array_position(${(input.ids ?? null) as number[]}::bigint[], id) asc,
      case when ${sort} = 'id' and ${order} = 'asc' then id end asc,
      case when ${sort} = 'id' and ${order} = 'desc' then id end desc,
      case when ${sort} = 'created_at' and ${order} = 'asc' then created_at end asc,
      case when ${sort} = 'created_at' and ${order} = 'desc' then created_at end desc,
      case when ${sort} = 'updated_at' and ${order} = 'asc' then updated_at end asc,
      case when ${sort} = 'updated_at' and ${order} = 'desc' then updated_at end desc,
      id asc
    limit ${input.limit}
    offset ${input.offset};
    `;

  return rows.map(mapSheetColumn);
}

export async function createSheetColumn(input: {
  sheetId: ID<"Sheet">;
  name: string;
  tags: string[];
}) {
  const row = await sqlOne<SheetColumnRow>`
    insert into sheet_columns (sheet_id, name, tags)
    values (${ID.parse(input.sheetId).id}, ${input.name}, ${input.tags})
    returning *;
    `;

  return mapSheetColumn(row);
}

export async function bulkCreateSheetColumn(input: {
  sheetId: ID<"Sheet">;
  columns: {
    name: string;
    tags: string[];
  }[];
}) {
  const rows = await sql<SheetColumnRow>`
    insert into sheet_columns (sheet_id, name, tags)
    select ${ID.parse(input.sheetId).id}, columns.name, columns.tags
    from jsonb_to_recordset(${JSON.stringify(input.columns)}::jsonb)
      as columns(name text, tags text[])
    returning *;
    `;

  return rows.map(mapSheetColumn);
}
