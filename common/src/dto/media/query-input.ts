import z from "zod";
import { Path } from "../path";
import { zID } from "../primitives";

export const QueryMediaInput = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(255),
  query: z.string().optional(),
  path: Path.optional(),
  rootId: zID("Media").optional(),
  ids: zID("Media").array().optional(),
  tags: z.string().array().optional(),
  sort: z.enum(["name", "created_at", "updated_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type QueryMediaInput = z.infer<typeof QueryMediaInput>;
