import { oc } from "@orpc/contract";
import z from "zod";
import { Publisher } from "../../dto/publisher";
import { CreatePublisherInput } from "../../dto/publisher/create-input";
import { QueryPublishersInput } from "../../dto/publisher/query-input";
import { UpdatePublisherInput } from "../../dto/publisher/update-input";

export const publishers = oc.prefix("/publishers").router({
  create: oc
    .route({
      description: "Create publisher.",
    })
    .input(CreatePublisherInput)
    .output(Publisher),

  update: oc
    .route({
      description: "Update publisher.",
    })
    .input(UpdatePublisherInput)
    .output(Publisher),

  get: oc
    .route({
      description: "Get publisher.",
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
});
