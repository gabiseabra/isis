import z from "zod";
import { zID } from "../primitives";

export const SheetCell = z.object({
  sheetId: zID("Sheet"),
  rowId: z.number(),
  columnId: z.number(),
  value: z.unknown(),
});

export type SheetCell = z.infer<typeof SheetCell>;

export const SheetRow = z.object({
  sheetId: zID("Sheet"),
  rowId: z.number(),
  cells: SheetCell.omit({ sheetId: true, rowId: true }).array(),
});

export type SheetRow = z.infer<typeof SheetRow>;
