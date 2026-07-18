import z from "zod";
import { createRecord } from "../utils/object";
import { ParseError } from "../utils/parse-zod-object";
import { SheetColumn, SheetRow } from "./sheet";

const zDraftState = <K extends string>(columns: K[]) => {
  return z.object({
    row: SheetRow,
    columns: z.object(createRecord(columns, () => SheetColumn)),
    errors: z
      .object({
        path: z.enum([".", ...columns]),
        error: z.string(),
      })
      .array(),
  });
};

export type DraftState<K extends PropertyKey> = {
  row: SheetRow;
  columns: { [k in K]: SheetColumn };
  errors: ParseError<K>[];
};

export const DraftState = Object.assign(zDraftState, {
  getCell<K extends PropertyKey>(
    draft: Pick<DraftState<K>, "columns" | "row">,
    columnName: K,
  ) {
    const col = draft.columns[columnName];
    const cell =
      col && draft.row.cells.find((cell) => (cell.columnId = col.columnId));
    return cell;
  },
  getErrors<K extends PropertyKey>(
    draft: Pick<DraftState<K>, "errors">,
    columnName: "." | K,
  ): string[] {
    return draft.errors
      .filter((e) => e.path === columnName)
      .map((e) => e.error);
  },
});
