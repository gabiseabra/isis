import { adminApi } from "@isis/common/orpc/admin";
import { ID } from "@isis/common/utils/id";
import { implement } from "@orpc/server";
import {
  createAuthor,
  getAuthor,
  queryAuthors,
  updateAuthor,
} from "../../services/authors/db";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.authors).$context<ORPCContext>();

export const authors = c.router({
  upsert: c.upsert.use(requireAuth).handler(async ({ input }) => {
    return input.id
      ? await updateAuthor({
          ...input,
          id: ID.parse(input.id).id,
        })
      : await createAuthor(input);
  }),

  get: c.get.use(requireAuth).handler(async ({ input }) => {
    return await getAuthor(ID.parse(input.id).id);
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const items = await queryAuthors({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
      ids: input.ids?.map((id) => ID.parse(id).id),
    });

    return {
      items: items.slice(0, input.limit),
      hasNextPage: items.length > input.limit,
    };
  }),
});
