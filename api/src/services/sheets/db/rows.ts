import { SheetCell, SheetRow } from "@isis/common/dto/sheet";
import { groupBy } from "@isis/common/utils/array";
import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { nest } from "../../../db/nest";
import { sql, sqlOne } from "../../../db/sql";

class SheetRowRow {
  constructor(
    public id: number,
    public sheet_id: number,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

class SheetCellRow {
  constructor(
    public sheet_id: number,
    public column_id: number,
    public row_id: number,
    public value: unknown,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}

function mapSheetCell(row: SheetCellRow): SheetCell {
  return {
    sheetId: ID.create("Sheet", row.sheet_id),
    columnId: row.column_id,
    rowId: row.row_id,
    value: row.value,
  };
}

function mapSheetRow(row: SheetRowRow): SheetRow {
  return {
    sheetId: ID.create("Sheet", row.sheet_id),
    rowId: row.id,
    cells: [],
  };
}

////

export async function getSheetRow(input: {
  sheetId: ID<"Sheet">;
  rowId: number;
  columnIds: number[];
}) {
  const rows = await sql<SheetCellRow>`
    select * from sheet_cells
    where sheet_id = ${ID.parse(input.sheetId).id}
      and row_id = ${input.rowId}
      and column_id = any(${input.columnIds}::bigint[])
    order by array_position(${input.columnIds}::bigint[], column_id) asc;
    `;

  return {
    sheetId: input.sheetId,
    rowId: input.rowId,
    cells: rows.map(mapSheetCell),
  } satisfies SheetRow;
}

export async function querySheetRows(input: {
  sheetId: ID<"Sheet">;
  /** column ids to include in the result */
  columnIds: number[];
  offset: number;
  limit: number;
  query?: string;
  ids?: number[];
  sort?: "id" | "created_at" | "updated_at" | `column_${number}`;
  order?: "asc" | "desc";
}) {
  const rows = await sql<SheetCellRow>`
    select sheet_cells.* from sheet_cells
    join sheet_rows on sheet_rows.sheet_id = sheet_cells.sheet_id
      and sheet_rows.id = sheet_cells.row_id
    where sheet_cells.sheet_id = ${ID.parse(input.sheetId).id}
      and sheet_cells.column_id = any(${input.columnIds}::bigint[])
      and sheet_rows.id = any(coalesce(${(input.ids ?? null) as number[]}::bigint[], array[sheet_rows.id]))
      and (${input.query ?? null}::text is null or exists (
        select 1 from sheet_cells query_cells
        where query_cells.sheet_id = sheet_rows.sheet_id
          and query_cells.row_id = sheet_rows.id
          and query_cells.value::text ilike '%' || ${input.query ?? null} || '%'
      ))
    order by
      case when ${input.sort ?? "id"} = 'id' and ${input.order ?? "asc"} = 'asc' then sheet_rows.id end asc,
      case when ${input.sort ?? "id"} = 'id' and ${input.order ?? "asc"} = 'desc' then sheet_rows.id end desc,
      case when ${input.sort ?? "id"} = 'created_at' and ${input.order ?? "asc"} = 'asc' then sheet_rows.created_at end asc,
      case when ${input.sort ?? "id"} = 'created_at' and ${input.order ?? "asc"} = 'desc' then sheet_rows.created_at end desc,
      case when ${input.sort ?? "id"} = 'updated_at' and ${input.order ?? "asc"} = 'asc' then sheet_rows.updated_at end asc,
      case when ${input.sort ?? "id"} = 'updated_at' and ${input.order ?? "asc"} = 'desc' then sheet_rows.updated_at end desc,
      case when ${input.sort ?? "id"} like 'column_%' and ${input.order ?? "asc"} = 'asc' then (
        select sort_cells.value::text from sheet_cells sort_cells
        where sort_cells.sheet_id = sheet_rows.sheet_id
          and sort_cells.row_id = sheet_rows.id
          and sort_cells.column_id = replace(${input.sort ?? "id"}, 'column_', '')::bigint
      ) end asc,
      case when ${input.sort ?? "id"} like 'column_%' and ${input.order ?? "asc"} = 'desc' then (
        select sort_cells.value::text from sheet_cells sort_cells
        where sort_cells.sheet_id = sheet_rows.sheet_id
          and sort_cells.row_id = sheet_rows.id
          and sort_cells.column_id = replace(${input.sort ?? "id"}, 'column_', '')::bigint
      ) end desc,
      sheet_rows.id asc,
      array_position(${input.columnIds}::bigint[], sheet_cells.column_id) asc
    limit ${input.limit * input.columnIds.length}
    offset ${input.offset * input.columnIds.length};
    `;

  return groupBy(rows, (row) => row.row_id).map(([rowId, cells]) => ({
    sheetId: input.sheetId,
    rowId,
    cells: cells.map(mapSheetCell),
  })) satisfies SheetRow[];
}

export async function createSheetRow(sheetId: ID<"Sheet">) {
  const row = await sqlOne<SheetRowRow>`
    insert into sheet_rows (sheet_id)
    values (${ID.parse(sheetId).id})
    returning *;
    `;

  return mapSheetRow(row);
}

export async function bulkCreateSheetRow(input: {
  sheetId: ID<"Sheet">;
  count: number;
}) {
  const sheetId = ID.parse(input.sheetId).id;

  const rows = await sql<SheetRowRow>`
    insert into sheet_rows (sheet_id)
    select *
    from UNNEST(${Array.from({ length: input.count }, () => sheetId)} :: bigint[])
    returning *;
    `;

  return rows.map(mapSheetRow);
}

export async function upsertSheetCell(input: {
  sheetId: ID<"Sheet">;
  columnId: number;
  rowId: number;
  value: string;
}) {
  const row = await sqlOne<SheetCellRow>`
    insert into sheet_cells (sheet_id, column_id, row_id, value)
    values (${ID.parse(input.sheetId).id}, ${input.columnId}, ${input.rowId}, ${JSON.stringify(input.value)}::jsonb)
    on conflict (column_id, row_id) do update
    set value = excluded.value,
      updated_at = now()
    returning *;
    `;

  return mapSheetCell(row);
}

export async function bulkUpsertSheetCell(input: {
  sheetId: ID<"Sheet">;
  cells: NonEmpty<{
    columnId: number;
    rowId: number;
    value: unknown;
  }>;
}) {
  const { columnId, rowId, value } = nest(input.cells);

  const rows = await sql<SheetCellRow>`
    insert into sheet_cells (sheet_id, column_id, row_id, value)
    select ${ID.parse(input.sheetId).id}, *
    from UNNEST(
      ${columnId} :: bigint[],
      ${rowId} :: bigint[],
      ${value.map((value) => JSON.stringify(value))} :: jsonb[]
    )
    on conflict (column_id, row_id) do update
    set value = excluded.value,
      updated_at = now()
    returning *;
    `;

  return rows.map(mapSheetCell);
}
