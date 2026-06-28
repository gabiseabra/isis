import { adminApi } from "@isis/common/orpc/admin";
import { implement } from "@orpc/server";
import { LanguageRow } from "../../services/languages/row";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.languages).$context<ORPCContext>();

export const languages = c.router({
  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const rows = await LanguageRow.query({
      limit: input.limit,
      offset: (input.page - 1) * input.limit,
      query: input.query,
    });

    return rows.map(LanguageRow.toJson);
  }),
});
