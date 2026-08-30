import { oc } from "@orpc/contract";
import z from "zod";
import { BookPage } from "../../../dto/book/page";
import { QueryBookPagesInput } from "../../../dto/book/page/query-input";
import { bookPageDrafts } from "./pages/drafts";

export const bookPages = oc.prefix("/books/pages").router({
  drafts: bookPageDrafts,

  get: oc
    .route({
      description: "Get book page metadata.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(BookPage.pick({ id: true }))
    .output(BookPage),

  query: oc
    .route({
      description: "Query book pages.",
    })
    .input(QueryBookPagesInput)
    .output(
      z.object({
        items: BookPage.array(),
        hasNextPage: z.boolean(),
      }),
    ),

  count: oc
    .route({
      description: "Count book pages.",
    })
    .input(
      QueryBookPagesInput.omit({
        limit: true,
        page: true,
        sort: true,
        order: true,
      }),
    )
    .output(z.number()),
});
