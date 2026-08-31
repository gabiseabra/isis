import z from "zod";
import { omitUndefined } from "../../utils/object";
import { Author } from "../author";
import { AuthorInput } from "../author/input";
import { Book } from "../book";
import { zID } from "../primitives";
import { Publisher } from "../publisher";
import { PublisherInput } from "../publisher/input";
import { BookStatus } from "./status";

const zBookInput = z.object({
  id: zID("Book").optional(),
  status: BookStatus,
  title: z.string(),
  slug: z.string().optional(),
  isbn: z.string().optional(),
  imageUrl: z.string().optional(),
  publishYear: z.number().optional(),
  publisher: z.union([Publisher.pick({ id: true }), PublisherInput]).optional(),
  authors: z.union([Author.pick({ id: true }), AuthorInput]).array(),
  languages: z.string().length(2).array(),
  tags: z.string().array(),
});

export type BookInput = z.infer<typeof zBookInput>;

export const BookInput = Object.assign(zBookInput, {
  default(input: Partial<BookInput>): BookInput {
    return {
      status: "unpublished",
      title: "",
      authors: [],
      languages: [],
      tags: [],
      ...omitUndefined(input),
    };
  },

  fromBook(book: Book): BookInput {
    return {
      id: book.id,
      status: book.status,
      title: book.title,
      slug: book.slug,
      isbn: book.isbn,
      imageUrl: book.imageUrl,
      authors: book.authorIds.map((id) => ({ id })),
      publishYear: book.publishYear,
      publisher: book.publisherId ? { id: book.publisherId } : undefined,
      languages: book.languages,
      tags: book.tags,
    };
  },
});
