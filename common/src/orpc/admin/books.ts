import { oc } from "@orpc/contract";
import z from "zod";
import { Book } from "../../dto/book";
import { DraftBook } from "../../dto/book/draft";
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
      description: "Get book draft data.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Book.pick({ id: true }))
    .output(DraftBook.nullable()),

  upsertDraft: oc
    .route({
      description: "Save draft book data or create new draft.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(
      BookInput.extend({
        id: Book.shape.id.optional(),
      }),
    )
    .output(DraftBook),

  applyDraft: oc
    .route({
      description: ".",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Book.pick({ id: true }))
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
