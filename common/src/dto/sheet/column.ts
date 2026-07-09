import z from "zod";
import { ID } from "../../utils/id";

export const SheetColumn = z.object({
  sheetId: z.string().refine(ID.guard("Sheet")),
  columnId: z.number(),
  name: z.string(),
  tags: z.string().array(),
});

export type SheetColumn = z.infer<typeof SheetColumn>;
