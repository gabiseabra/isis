import { adminApi } from "@isis/common/orpc/admin";
import { implement } from "@orpc/server";
import { queryLanguages } from "../../services/languages/db";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.languages).$context<ORPCContext>();

export const languages = c.router({
  query: c.query.use(requireAuth).handler(async ({ input }) => {
    return await queryLanguages({
      limit: input.limit,
      offset: (input.page - 1) * input.limit,
      query: input.query,
    });
  }),
});
