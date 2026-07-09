import z from "zod";
import { ID } from "../../utils/id";

export const QuerySheetRowsInput = z.object({
  sheetId: z.string().refine(ID.guard("Sheet")),
  offset: z.number(),
  limit: z.number(),
  ids: z.number().array().optional(),
  sort: z
    .union([
      z.enum(["id", "created_at", "updated_at"]),
      z
        .string()
        .refine((key): key is `column:${number}` => /^column:(\d+)$/.test(key)),
    ])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type QuerySheetRowsInput = z.infer<typeof QuerySheetRowsInput>;
