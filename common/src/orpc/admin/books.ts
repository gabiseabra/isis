import { oc } from "@orpc/contract";
import z from "zod";
import { Book } from "../../dto/book";
import { DraftBook, DraftBookResult } from "../../dto/book/draft";
import { BookInput } from "../../dto/book/input";
import { QueryBooksInput } from "../../dto/book/query-input";

export const books = oc.prefix("/books").router({
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

  getDraft: oc
    .route({
      description: "Get active book draft data.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Book.pick({ id: true }))
    .output(DraftBookResult.nullable()),

  upsertDraft: oc
    .route({
      description: "Save draft book data or create new draft.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(BookInput)
    .output(DraftBookResult),

  applyDraft: oc
    .route({
      description: ".",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(DraftBook.pick({ uuid: true }))
    .output(Book),

  discardDraft: oc
    .route({
      description: ".",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Book.pick({ id: true }))
    .output(z.void()),
});
