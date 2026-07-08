import { adminApi } from "@isis/common/orpc/admin";
import { ID } from "@isis/common/utils/id";
import { implement } from "@orpc/server";
import {
  createPublisher,
  getPublisher,
  queryPublishers,
  updatePublisher,
} from "../../services/publishers/db";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.publishers).$context<ORPCContext>();

export const publishers = c.router({
  upsert: c.upsert.use(requireAuth).handler(async ({ input }) => {
    return input.id
      ? await updatePublisher({
          ...input,
          id: ID.parse(input.id).id,
        })
      : await createPublisher(input);
  }),

  get: c.get.use(requireAuth).handler(async ({ input }) => {
    return await getPublisher(ID.parse(input.id).id);
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const items = await queryPublishers({
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
      ids: input.ids?.map((id) => ID.parse(id).id),
      name: input.name,
      sort: input.sort,
      order: input.order,
      query: input.query,
    });

    return {
      items: items.slice(0, input.limit),
      hasNextPage: items.length > input.limit,
    };
  }),
});
