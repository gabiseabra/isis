import { oc } from "@orpc/contract";
import z from "zod";
import { Book } from "../../dto/book";
import { QueryBooksInput } from "../../dto/book/query-input";

const BookOutput = Book.omit({
  authorIds: true,
  languages: true,
  tags: true,
});

export const books = oc.prefix("/books").router({
  get: oc
    .route({
      description: "Get book.",
    })
    .input(Book.pick({ id: true }))
    .output(BookOutput),

  query: oc
    .route({
      description: "Query books.",
    })
    .input(QueryBooksInput)
    .output(
      z.object({
        items: BookOutput.array(),
        hasNextPage: z.boolean(),
      }),
    ),
});
