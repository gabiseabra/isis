import { oc } from "@orpc/contract";
import z from "zod";
import { Author } from "../../dto/author";
import { AuthorInput } from "../../dto/author/input";
import { QueryAuthorsInput } from "../../dto/author/query-input";

export const authors = oc.prefix("/authors").router({
  upsert: oc
    .route({
      description: "Create or update author.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(AuthorInput)
    .output(Author),

  get: oc
    .route({
      description: "Get author.",
    })
    .errors({
      NOT_FOUND: {},
    })
    .input(Author.pick({ id: true }))
    .output(Author),

  query: oc
    .route({
      description: "Query authors.",
    })
    .input(QueryAuthorsInput)
    .output(
      z.object({
        items: Author.array(),
        hasNextPage: z.boolean(),
      }),
    ),
});
