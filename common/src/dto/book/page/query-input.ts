import z from "zod";
import { zID } from "../../primitives";

export const QueryBookPagesInput = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(255),
  offset: z.number().int().min(0),
  sort: z.enum(["page_number", "created_at", "updated_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  bookId: zID("Book").optional(),
  query: z.string().optional(),
  tags: z.string().array().optional(),
  types: z.string().array().optional(),
  minPageNumber: z.number().optional(),
  maxPageNumber: z.number().optional(),
  ids: zID("BookPage").array().optional(),
});

export type QueryBookPagesInput = z.infer<typeof QueryBookPagesInput>;
