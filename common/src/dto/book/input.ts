import z from "zod";
import { Author } from "../author";
import { AuthorInput } from "../author/input";
import { zID } from "../primitives";
import { Publisher } from "../publisher";
import { PublisherInput } from "../publisher/input";

export const BookInput = z.object({
  id: zID("Book").optional(),
  title: z.string(),
  slug: z.string().optional(),
  isbn13: z.string().optional(),
  isbn10: z.string().optional(),
  imageUrl: z.string().optional(),
  publishYear: z.number().optional(),
  publisher: z.union([Publisher.pick({ id: true }), PublisherInput]).optional(),
  authors: z.union([Author.pick({ id: true }), AuthorInput]).array(),
  languages: z.string().length(2).array(),
  tags: z.string().array(),
});

export type BookInput = z.infer<typeof BookInput>;
