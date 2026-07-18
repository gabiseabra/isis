import { SheetColumn, SheetRow } from "@isis/common/dto/sheet";
import { combinations, zip } from "@isis/common/utils/array";
import { hasPropertyValue } from "@isis/common/utils/guards";
import { hash } from "@isis/common/utils/hash";
import { NonEmpty } from "@isis/common/utils/non-empty";
import crypto from "node:crypto";
import { unit } from "../../db/unit";
import {
  bulkCreateSheetColumn,
  bulkCreateSheetRow,
  bulkUpsertSheetCell,
  createSheet,
} from "./db";

export async function createSheetFromJson<K extends PropertyKey>(
  fileName: string,
  _columns: { key: K; name: string; tags: string[] }[],
  _rows: { [k in K]?: unknown }[],
): Promise<{
  columns: (SheetColumn & { key: K })[];
  rows: SheetRow[];
}> {
  const fileHash = crypto.hash("md5", hash(_rows), "hex");

  return unit(async () => {
    // create sheet
    const sheet = await createSheet({ fileName, fileHash });

    // create columns
    const columns = NonEmpty.isNonEmpty(_columns)
      ? zip(
          _columns,
          await bulkCreateSheetColumn({
            sheetId: sheet.id,
            columns: _columns,
          }),
          ({ key }, col) => ({ key, ...col }),
        )
      : [];

    // create rows
    const rows = await bulkCreateSheetRow({
      sheetId: sheet.id,
      count: _rows.length,
    });

    // create cells
    const _cells = combinations(columns, rows, (col, row, _colIx, rowIx) => ({
      columnId: col.columnId,
      rowId: row.rowId,
      value: _rows[rowIx][col.key],
    }));
    const cells = NonEmpty.isNonEmpty(_cells)
      ? await bulkUpsertSheetCell({
          sheetId: sheet.id,
          cells: _cells,
        })
      : [];

    return {
      columns,
      rows: rows.map((row) => ({
        ...row,
        cells: cells.filter(hasPropertyValue("rowId", row.rowId)),
      })),
    };
  });
}
