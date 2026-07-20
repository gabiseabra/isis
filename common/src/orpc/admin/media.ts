import { oc } from "@orpc/contract";
import z from "zod";
import { Media } from "../../dto/media";
import { MediaInput } from "../../dto/media/input";
import { QueryMediaInput } from "../../dto/media/query-input";

export const media = oc.prefix("/media").router({
  get: oc
    .route({
      description: "Get media entry.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Media.pick({ id: true }))
    .output(Media),

  query: oc
    .route({
      description: "Query recursive children of rootId entry.",
    })
    .input(QueryMediaInput)
    .output(
      z.object({
        items: Media.array(),
        hasNextPage: z.boolean(),
      }),
    ),

  queryChildren: oc
    .route({
      description: "Query immediate children of rootId entry.",
    })
    .input(QueryMediaInput)
    .output(
      z.object({
        items: Media.array(),
        hasNextPage: z.boolean(),
      }),
    ),

  update: oc
    .route({
      description: "Update media entry",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(
      MediaInput.extend({
        id: Media.shape.id,
      }),
    )
    .output(Media),
});
