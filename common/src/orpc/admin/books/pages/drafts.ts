import { oc } from "@orpc/contract";
import z from "zod";
import {
  DraftBookPage,
  DraftBookPageResult,
} from "../../../../dto/book/page/draft";
import { BookPageInput } from "../../../../dto/book/page/input";
import { QueryBookPagesInput } from "../../../../dto/book/page/query-input";
import { UUID } from "../../../../dto/uuid";

export const bookPageDrafts = oc.prefix("/books/pages/drafts").router({
  query: oc
    .route({
      description: "Query draft book pages.",
    })
    .input(
      QueryBookPagesInput.extend({
        uuid: UUID.optional(),
      }),
    )
    .output(
      z.object({
        items: DraftBookPage.array(),
        hasNextPage: z.boolean(),
      }),
    ),

  upsert: oc
    .route({
      description: "Save draft book page data or create new draft.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(BookPageInput)
    .output(DraftBookPageResult),

  delete: oc
    .route({
      description: "Delete draft book page data.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(DraftBookPage.pick({ uuid: true }))
    .output(z.void()),
});
