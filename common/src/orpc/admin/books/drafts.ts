import { oc } from "@orpc/contract";
import z from "zod";
import { Book } from "../../../dto/book";
import { DraftBook, DraftBookResult } from "../../../dto/book/draft";
import { BookInput } from "../../../dto/book/input";

export const bookDrafts = oc.prefix("/books/drafts").router({
  get: oc
    .route({
      description: "Get active book draft data.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(z.union([Book.pick({ id: true }), DraftBook.pick({ uuid: true })]))
    .output(DraftBookResult.nullable()),

  upsert: oc
    .route({
      description: "Save draft book data or create new draft.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(BookInput)
    .output(DraftBookResult),

  apply: oc
    .route({
      description: "Apply draft book data.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(DraftBook.pick({ uuid: true }))
    .output(Book),

  delete: oc
    .route({
      description: "Delete draft book data.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Book.pick({ id: true }))
    .output(z.void()),
});
