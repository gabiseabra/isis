import { oc } from "@orpc/contract";
import z from "zod";
import { Language } from "../../dto/language";

export const languages = oc.prefix("/languages").router({
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
    .output(Language.array()),
});
