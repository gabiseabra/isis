import { oc } from "@orpc/contract";
import z from "zod";
import { Country } from "../../dto/country";

export const countries = oc.prefix("/countries").router({
  query: oc
    .route({
      description: "Query countries.",
    })
    .input(
      z.object({
        page: z.number().int().min(1),
        limit: z.number().int().min(1).max(255),
        query: z.string().optional(),
      }),
    )
    .output(Country.array()),
});
