import { oc } from "@orpc/contract";
import z from "zod";
import { Publisher } from "../../dto/publisher";
import { PublisherInput } from "../../dto/publisher/input";
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

  upsert: oc
    .route({
      description: "Create or update publisher.",
    })
    .input(
      PublisherInput.extend({
        id: Publisher.shape.id.optional(),
      }),
    )
    .output(Publisher),
});
