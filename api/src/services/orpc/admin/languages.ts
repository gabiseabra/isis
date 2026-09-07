import { adminApi } from "@isis/common/orpc/admin";
import { never } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import { getLanguage, queryLanguages } from "../../languages/repo";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.languages).$context<ORPCContext>();

export const languages = c.router({
  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    return (await getLanguage(input.code)) ?? never(errors.NOT_FOUND());
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const items = await queryLanguages({
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
      query: input.query,
    });

    return {
      items: items.slice(0, input.limit),
      hasNextPage: items.length > input.limit,
    };
  }),
});
