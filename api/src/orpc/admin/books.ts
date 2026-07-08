import { adminApi } from "@isis/common/orpc/admin";
import { ID } from "@isis/common/utils/id";
import { implement } from "@orpc/server";
import { getBook, queryBooks } from "../../services/books/db";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.books).$context<ORPCContext>();

export const books = c.router({
  get: c.get.use(requireAuth).handler(async ({ input }) => {
    return await getBook(ID.parse(input.id).id);
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const items = await queryBooks({
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
