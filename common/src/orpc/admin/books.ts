import { oc } from "@orpc/contract";
import z from "zod";
import { Book } from "../../dto/book";
import { QueryBooksInput } from "../../dto/book/query-input";
import { bookDrafts } from "./books/drafts";
import { bookPages } from "./books/pages";

export const books = oc.prefix("/books").router({
  drafts: bookDrafts,
  pages: bookPages,

  get: oc
    .route({
      description: "Get book.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Book.pick({ id: true }))
    .output(Book),

  query: oc
    .route({
      description: "Query books.",
    })
    .input(QueryBooksInput)
    .output(
      z.object({
        items: Book.array(),
        hasNextPage: z.boolean(),
      }),
    ),
});
