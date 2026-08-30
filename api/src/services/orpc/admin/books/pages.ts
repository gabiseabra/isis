import { adminApi } from "@isis/common/orpc/admin";
import { implement } from "@orpc/server";
import {
  countBookPages,
  getBookPage,
  queryBookPages,
} from "../../../books/repo/pages";
import { ORPCContext } from "../../context";
import { requireAuth } from "../../middleware/auth";
import { bookPageDrafts } from "./pages/drafts";

const c = implement(adminApi.books.pages).$context<ORPCContext>();

export const bookPages = c.router({
  drafts: bookPageDrafts,

  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    return (
      (await getBookPage(input.id)) ??
      (() => {
        throw errors.NOT_FOUND();
      })()
    );
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const items = await queryBookPages({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
    });

    return {
      items: items.slice(0, input.limit),
      hasNextPage: items.length > input.limit,
    };
  }),

  count: c.count.use(requireAuth).handler(async ({ input }) => {
    return countBookPages(input);
  }),
});
