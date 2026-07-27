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
    .input(z.union([Media.pick({ id: true }), z.object({ path: z.string() })]))
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

  upsert: oc
    .route({
      description: "Update media entry",
    })
    .errors({
      NOT_FOUND: {},
      UNPROCESSABLE_CONTENT: {},
    })
    .input(
      MediaInput.extend({
        id: Media.shape.id.optional(),
      }),
    )
    .output(Media),

  createUploadUrl: oc
    .route({
      description: "Create signed media upload URL",
    })
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
      }),
    )
    .output(
      z.object({
        key: z.string(),
        url: z.string(),
      }),
    ),
});
