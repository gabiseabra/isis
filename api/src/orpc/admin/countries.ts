import { adminApi } from "@isis/common/orpc/admin";
import { implement } from "@orpc/server";
import { queryCountries } from "../../services/countries/db";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.countries).$context<ORPCContext>();

export const countries = c.router({
  query: c.query.use(requireAuth).handler(async ({ input }) => {
    return await queryCountries({
      limit: input.limit,
      offset: (input.page - 1) * input.limit,
      query: input.query,
    });
  }),
});
