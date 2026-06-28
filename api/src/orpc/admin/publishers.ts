import { adminApi } from "@isis/common/orpc/admin";
import { ID } from "@isis/common/utils/id";
import { implement } from "@orpc/server";
import { PublisherRow } from "../../services/publishers/row";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.publishers).$context<ORPCContext>();

export const publishers = c.router({
  create: c.create.use(requireAuth).handler(async ({ input }) => {
    const row = await PublisherRow.create(input);

    return PublisherRow.toJson(row);
  }),

  update: c.update.use(requireAuth).handler(async ({ input }) => {
    const row = await PublisherRow.update({
      id: ID.parse(input.id).id,
      name: input.name,
      imageUrl: input.imageUrl,
      countryCode: input.countryCode,
    });

    return PublisherRow.toJson(row);
  }),

  get: c.get.use(requireAuth).handler(async ({ input }) => {
    const row = await PublisherRow.get(ID.parse(input.id).id);

    return PublisherRow.toJson(row);
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const rows = await PublisherRow.query({
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
      ids: input.ids?.map((id) => ID.parse(id).id),
      name: input.name,
      sort: input.sort,
      order: input.order,
      query: input.query,
    });
    const items = rows.slice(0, input.limit);

    return {
      items: items.map(PublisherRow.toJson),
      hasNextPage: rows.length > input.limit,
    };
  }),
});
