import z from "zod";
import { ID } from "../../utils/id";

export const QueryPublisherInput = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(255),
  sort: z.enum(["name", "created_at", "updated_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  query: z.string().optional(),
  name: z.string().optional(),
  ids: z.string().refine(ID.guard("Publisher")).array().optional(),
});

export type QueryPublisherInput = z.infer<typeof QueryPublisherInput>;
