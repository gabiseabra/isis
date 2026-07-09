import z from "zod";
import { ID } from "../../utils/id";

export const SheetMetadata = z.object({
  id: z.string().refine(ID.guard("Sheet")),
  fileName: z.string(),
  fileHash: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SheetMetadata = z.infer<typeof SheetMetadata>;
