import z from "zod";
import { ID } from "../../utils/id";

export const QuerySheetColumnsInput = z.object({
  sheetId: z.string().refine(ID.guard("Sheet")),
  offset: z.number(),
  limit: z.number(),
  ids: z.number().array().optional(),
  tags: z.string().array().optional(),
  sort: z.enum(["id", "created_at", "updated_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type QuerySheetColumnsInput = z.infer<typeof QuerySheetColumnsInput>;
