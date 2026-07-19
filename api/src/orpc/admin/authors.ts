import { adminApi } from "@isis/common/orpc/admin";
import { never } from "@isis/common/utils/error";
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
  upsert: c.upsert.use(requireAuth).handler(async ({ input, errors }) => {
    return input.id
      ? ((await updateAuthor({
          ...input,
          id: ID.parse(input.id).id,
        })) ?? never(errors.NOT_FOUND()))
      : await createAuthor(input);
  }),

  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    return (
      (await getAuthor(ID.parse(input.id).id)) ?? never(errors.NOT_FOUND())
    );
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
