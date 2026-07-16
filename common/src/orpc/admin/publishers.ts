import { oc } from "@orpc/contract";
import z from "zod";
import { DraftState } from "../../dto/draft-state";
import { Publisher } from "../../dto/publisher";
import { DraftPublisher } from "../../dto/publisher/draft";
import { QueryPublishersInput } from "../../dto/publisher/query-input";

export const publishers = oc.prefix("/publishers").router({
  get: oc
    .route({
      description: "Get publisher.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Publisher.pick({ id: true }))
    .output(Publisher),

  query: oc
    .route({
      description: "Query publishers.",
    })
    .input(QueryPublishersInput)
    .output(
      z.object({
        items: Publisher.array(),
        hasNextPage: z.boolean(),
      }),
    ),

  getDraft: oc
    .route({
      description: "Get publisher draft.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Publisher.pick({ id: true }))
    .output(DraftState(DraftPublisher)),

  upsertDraft: oc
    .route({
      description: "Create or update publisher draft.",
    })
    .input(DraftPublisher)
    .output(Publisher),
});
