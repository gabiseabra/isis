import { SheetColumn } from "@isis/common/dto/sheet";
import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { createRecord } from "@isis/common/utils/object";
import { sql, sqlOne } from "../../../db/sql";

class SheetColumnRow {
  constructor(
    public id: number,
    public sheet_id: number,
    public name: string,
    public target: string | null,
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
    target: row.target ?? undefined,
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
  offset?: number;
  limit?: number;
  ids?: number[];
  tags?: string[];
  targets?: string[];
  sort?: "id" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}) {
  const sort = input.sort ?? "id";
  const order = input.order ?? "asc";

  const rows = await sql<SheetColumnRow>`
    select * from sheet_columns
    where sheet_id = ${ID.parse(input.sheetId).id}
      and id = any(coalesce(${(input.ids ?? null) as number[]}, array[id]))
      and target = any(coalesce(${(input.targets ?? null) as string[]}, array[target]))
      and tags @> coalesce(${(input.tags ?? null) as string[]}, array[]::text[])
    order by
      array_position(${(input.ids ?? null) as number[]}::bigint[], id) asc,
      case when ${sort} = 'id' and ${order} = 'asc' then id end asc,
      case when ${sort} = 'id' and ${order} = 'desc' then id end desc,
      case when ${sort} = 'created_at' and ${order} = 'asc' then created_at end asc,
      case when ${sort} = 'created_at' and ${order} = 'desc' then created_at end desc,
      case when ${sort} = 'updated_at' and ${order} = 'asc' then updated_at end asc,
      case when ${sort} = 'updated_at' and ${order} = 'desc' then updated_at end desc,
      id asc
    limit ${input.limit ?? null}
    offset ${input.offset ?? 0};
    `;

  return rows.map(mapSheetColumn);
}

export async function createSheetColumn(input: {
  sheetId: ID<"Sheet">;
  name: string;
  target?: string;
  tags: string[];
}) {
  const row = await sqlOne<SheetColumnRow>`
    insert into sheet_columns (sheet_id, name, target, tags)
    values (
      ${ID.parse(input.sheetId).id},
      ${input.name},
      ${input.target ?? null},
      ${input.tags}
    )
    returning *;
    `;

  return mapSheetColumn(row);
}

export async function bulkCreateSheetColumn(input: {
  sheetId: ID<"Sheet">;
  columns: NonEmpty<{
    name: string;
    target?: string;
    tags: string[];
  }>;
}) {
  const rows = await sql<SheetColumnRow>`
    insert into sheet_columns (sheet_id, name, target, tags)
    select ${ID.parse(input.sheetId).id}, columns.name, columns.target, columns.tags
    from jsonb_to_recordset(${JSON.stringify(input.columns)}::jsonb)
      as columns(name text, target text, tags text[])
    returning *;
    `;

  return rows.map(mapSheetColumn);
}

export async function createSheetColumnRecord<K extends string>(
  sheetId: ID<"Sheet">,
  targets: Record<K, string>,
): Promise<Record<K, SheetColumn | null>> {
  const keys = Object.keys(targets) as K[];
  const columns = await querySheetColumns({
    sheetId,
    targets: keys.map((key) => targets[key]),
  });
  return createRecord(
    keys,
    (key) => columns.find((col) => col.target === targets[key]) ?? null,
  );
}
