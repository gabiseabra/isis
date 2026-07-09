import z from "zod";
import { ID } from "../../utils/id";

export const SheetCell = z.object({
  sheetId: z.string().refine(ID.guard("Sheet")),
  rowId: z.number(),
  columnId: z.number(),
  value: z.string().nullable(),
});

export type SheetCell = z.infer<typeof SheetCell>;

export const SheetRow = z.object({
  sheetId: z.string().refine(ID.guard("Sheet")),
  rowId: z.number(),
  cells: SheetCell.omit({ sheetId: true, rowId: true }).array(),
});

export type SheetRow = z.infer<typeof SheetRow>;
