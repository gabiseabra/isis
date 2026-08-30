import { adminApi } from "@isis/common/orpc/admin";
import { never } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import { getDraftBookPageResult } from "../../../../books/get-draft";
import { getActiveDraftBook } from "../../../../books/repo";
import {
  deleteDraftBookPage,
  getDraftBookPage,
  queryDraftBookPages,
  upsertDraftBookPage,
} from "../../../../books/repo/draft-pages";
import { ORPCContext } from "../../../context";
import { requireAuth } from "../../../middleware/auth";

const c = implement(adminApi.books.pages.drafts).$context<ORPCContext>();

export const bookPageDrafts = c.router({
  query: c.query
    .use(requireAuth)
    .handler(async ({ input: { uuid, ...input } }) => {
      const items = await queryDraftBookPages({
        ...input,
        draftBookUuid: uuid,
        limit: input.limit + 1,
        offset: (input.page - 1) * input.limit,
      });

      return {
        items: items.slice(0, input.limit),
        hasNextPage: items.length > input.limit,
      };
    }),

  upsert: c.upsert.use(requireAuth).handler(async ({ input, errors }) => {
    const draft = await getActiveDraftBook(input.bookId);

    if (!draft) never(errors.NOT_FOUND());

    const { uuid } = await upsertDraftBookPage({
      draftBookUuid: draft.uuid,
      pageId: input.id ?? null,
      ...input,
    });

    return (await getDraftBookPageResult({ uuid })) ?? never("??");
  }),

  delete: c.delete.use(requireAuth).handler(async ({ input, errors }) => {
    if (!(await getDraftBookPage(input.uuid))) never(errors.NOT_FOUND());

    await deleteDraftBookPage(input.uuid);
  }),
});
