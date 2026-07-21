import { adminApi } from "@isis/common/orpc/admin";
import { createErrorHandler, never } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import {
  queryMediaEntry,
  queryMediaEntryChildren,
} from "../../services/media/db";
import {
  MediaInputUnprocessable,
  MediaNotFound,
} from "../../services/media/errors";
import { getMedia } from "../../services/media/get";
import { upsertMedia } from "../../services/media/upsert";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.media).$context<ORPCContext>();

export const media = c.router({
  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    return (await getMedia(input)) ?? never(errors.NOT_FOUND());
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const entries = await queryMediaEntry({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
    });
    const items = await Promise.all(
      entries.map((_entry) =>
        getMedia(_entry).then(
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
        getMedia(_entry).then(
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

  upsert: c.upsert.use(requireAuth).handler(async ({ input, errors }) => {
    return upsertMedia(input).catch(
      createErrorHandler()
        .catch(MediaNotFound, () => never(errors.NOT_FOUND()))
        .catch(MediaInputUnprocessable, (error) =>
          never(
            errors.UNPROCESSABLE_CONTENT({
              message: error.message,
            }),
          ),
        ),
    );
  }),

  upload: c.upload.use(requireAuth).handler(async ({ input, errors }) => {
    const { file: _file } = input;

    throw errors.UNPROCESSABLE_CONTENT();
  }),
});
