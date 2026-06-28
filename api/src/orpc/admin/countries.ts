import { adminApi } from "@isis/common/orpc/admin";
import { implement } from "@orpc/server";
import { CountryRow } from "../../services/countries/row";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.countries).$context<ORPCContext>();

export const countries = c.router({
  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const rows = await CountryRow.query({
      limit: input.limit,
      offset: (input.page - 1) * input.limit,
      query: input.query,
    });

    return rows.map(CountryRow.toJson);
  }),
});
