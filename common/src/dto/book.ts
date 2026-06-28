import z from "zod";
import { ID } from "../utils/id";

export const Book = z.object({
  id: z.string().refine(ID.guard("Book")),
  title: z.string(),
  slug: z.string(),
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
