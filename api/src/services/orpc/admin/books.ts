import { adminApi } from "@isis/common/orpc/admin";
import { implement } from "@orpc/server";
import { getBook, queryBooks } from "../../books/repo/books";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";
import { bookDrafts } from "./books/drafts";
import { bookPages } from "./books/pages";

const c = implement(adminApi.books).$context<ORPCContext>();

export const books = c.router({
  drafts: bookDrafts,
  pages: bookPages,

  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    return (
      (await getBook(input.id)) ??
      (() => {
        throw errors.NOT_FOUND();
      })()
    );
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const items = await queryBooks({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
    });

    return {
      items: items.slice(0, input.limit),
      hasNextPage: items.length > input.limit,
    };
  }),
});
