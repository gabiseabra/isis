import z from "zod";
import { ID } from "../utils/id";
import { BookStatus } from "./book/status";

export const Book = z.object({
  id: z.string().refine(ID.guard("Book")),
  status: BookStatus,
  title: z.string(),
  slug: z.string().optional(),
  isbn13: z.string().optional(),
  isbn10: z.string().optional(),
  imageUrl: z.string().optional(),
  publishYear: z.number().optional(),
  publisherId: z.string().refine(ID.guard("Publisher")).optional(),
  authorIds: z.string().refine(ID.guard("Author")).array(),
  languages: z.string().length(2).array(),
  tags: z.string().array(),
  createdById: z.string().refine(ID.guard("User")).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Book = z.infer<typeof Book>;
