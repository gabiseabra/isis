import { adminApi } from "@isis/common/orpc/admin";
import { ID } from "@isis/common/utils/id";
import { implement } from "@orpc/server";
import { BookRow } from "../../services/books/row";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.books).$context<ORPCContext>();

export const books = c.router({
  get: c.get.use(requireAuth).handler(async ({ input }) => {
    const row = await BookRow.get(ID.parse(input.id).id);

    return BookRow.toJson(row);
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const rows = await BookRow.query({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
      ids: input.ids?.map((id) => ID.parse(id).id),
    });
    const items = rows.slice(0, input.limit);

    return {
      items: items.map(BookRow.toJson),
      hasNextPage: rows.length > input.limit,
    };
  }),
});
