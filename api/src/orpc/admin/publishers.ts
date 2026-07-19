import { adminApi } from "@isis/common/orpc/admin";
import { never } from "@isis/common/utils/error";
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
  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    return (
      (await getPublisher(ID.parse(input.id).id)) ?? never(errors.NOT_FOUND())
    );
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

  upsert: c.upsert
    .use(requireAuth)
    .handler(async ({ input: { id: publisherId, ...input }, errors }) => {
      return publisherId
        ? ((await updatePublisher({
            id: publisherId,
            ...input,
          })) ?? never(errors.NOT_FOUND()))
        : await createPublisher(input);
    }),
});
