import { adminApi } from "@isis/common/orpc/admin";
import { never } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import {
  queryMediaEntry,
  queryMediaEntryChildren,
  updateMediaEntry,
} from "../../services/media/db";
import { getMedia } from "../../services/media/get";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.media).$context<ORPCContext>();

export const media = c.router({
  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    return (await getMedia(input.id)) ?? never(errors.NOT_FOUND());
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const entries = await queryMediaEntry({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
    });
    const items = await Promise.all(
      entries.map((_entry) =>
        getMedia(_entry.id).then(
          (entry) =>
            entry ??
            never(`media entry disappeared while hydrating ${_entry.id}`),
        ),
      ),
    );

    return {
      items: items.slice(0, input.limit),
      hasNextPage: items.length > input.limit,
    };
  }),

  queryChildren: c.queryChildren.use(requireAuth).handler(async ({ input }) => {
    const entries = await queryMediaEntryChildren({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
    });
    const items = await Promise.all(
      entries.map((_entry) =>
        getMedia(_entry.id).then(
          (entry) =>
            entry ??
            never(`media entry disappeared while hydrating ${_entry.id}`),
        ),
      ),
    );

    return {
      items: items.slice(0, input.limit),
      hasNextPage: items.length > input.limit,
    };
  }),

  update: c.update.use(requireAuth).handler(async ({ input, errors }) => {
    await updateMediaEntry(input);
    return (await getMedia(input.id)) ?? never(errors.NOT_FOUND());
  }),
});
