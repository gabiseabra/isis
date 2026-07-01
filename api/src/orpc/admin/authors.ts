import { adminApi } from "@isis/common/orpc/admin";
import { ID } from "@isis/common/utils/id";
import { implement } from "@orpc/server";
import { AuthorRow } from "../../services/authors/row";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.authors).$context<ORPCContext>();

export const authors = c.router({
  upsert: c.upsert.use(requireAuth).handler(async ({ input }) => {
    const row = input.id
      ? await AuthorRow.update({
          ...input,
          id: ID.parse(input.id).id,
        })
      : await AuthorRow.create(input);

    return AuthorRow.toJson(row);
  }),

  get: c.get.use(requireAuth).handler(async ({ input }) => {
    const row = await AuthorRow.get(ID.parse(input.id).id);

    return AuthorRow.toJson(row);
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const rows = await AuthorRow.query({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
      ids: input.ids?.map((id) => ID.parse(id).id),
    });
    const items = rows.slice(0, input.limit);

    return {
      items: items.map(AuthorRow.toJson),
      hasNextPage: rows.length > input.limit,
    };
  }),
});
