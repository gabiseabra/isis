import { oc } from "@orpc/contract";
import z from "zod";
import { Book } from "../../dto/book";
import { DraftBook } from "../../dto/book/draft";
import { QueryBooksInput } from "../../dto/book/query-input";
import { DraftState } from "../../dto/draft-state";

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
    .output(DraftState(DraftBook)),

  upsertDraft: oc
    .route({
      description: "Get book draft data.",
    })
    .input(DraftBook)
    .output(Book),
});
