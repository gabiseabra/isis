import { oc } from "@orpc/contract";
import z from "zod";
import { Language } from "../../dto/language";

export const languages = oc.prefix("/languages").router({
  get: oc
    .route({
      description: "Get language.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Language.pick({ code: true }))
    .output(Language),

  query: oc
    .route({
      description: "Query languages.",
    })
    .input(
      z.object({
        page: z.number().int().min(1),
        limit: z.number().int().min(1).max(255),
        query: z.string().optional(),
      }),
    )
    .output(
      z.object({
        items: Language.array(),
        hasNextPage: z.boolean(),
      }),
    ),
});
