import { oc } from "@orpc/contract";
import z from "zod";
import { Author } from "../../dto/author";
import { CreateAuthorInput } from "../../dto/author/create-input";
import { QueryAuthorsInput } from "../../dto/author/query-input";
import { UpdateAuthorInput } from "../../dto/author/update-input";

export const authors = oc.prefix("/authors").router({
  create: oc
    .route({
      description: "Create author.",
    })
    .input(CreateAuthorInput)
    .output(Author),

  update: oc
    .route({
      description: "Update author.",
    })
    .input(UpdateAuthorInput)
    .output(Author),

  get: oc
    .route({
      description: "Get author.",
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
