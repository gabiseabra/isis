import z from "zod";
import { BookStatus } from "./book/status";
import { zID } from "./primitives";

export const Book = z.object({
  id: zID("Book"),
  status: BookStatus,
  title: z.string(),
  slug: z.string().optional(),
  isbn: z.string().optional(),
  imageUrl: z.string().optional(),
  publishYear: z.number().optional(),
  publisherId: zID("Publisher").optional(),
  authorIds: zID("Author").array(),
  languages: z.string().length(2).array(),
  tags: z.string().array(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Book = z.infer<typeof Book>;
