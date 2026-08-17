import { adminApi } from "@isis/common/orpc/admin";
import { createErrorHandler, never } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import { applyDraftBook } from "../../books/apply";
import { DraftBookNotFound } from "../../books/errors";
import { getBook, queryBooks } from "../../books/repo/books";
import { getActiveDraftBook, upsertDraftBook } from "../../books/repo/drafts";
import { ORPCContext } from "../context";
import { requireAuth } from "../middleware/auth";

const c = implement(adminApi.books).$context<ORPCContext>();

export const books = c.router({
  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    return (
      (await getBook(input.id)) ??
      (() => {
        throw errors.NOT_FOUND();
      })()
    );
  }),

  query: c.query.use(requireAuth).handler(async ({ input }) => {
    const items = await queryBooks({
      ...input,
      limit: input.limit + 1,
      offset: (input.page - 1) * input.limit,
    });

    return {
      items: items.slice(0, input.limit),
      hasNextPage: items.length > input.limit,
    };
  }),

  getDraft: c.getDraft.use(requireAuth).handler(async ({ input, errors }) => {
    if (!(await getBook(input.id))) never(errors.NOT_FOUND());

    return getActiveDraftBook(input.id);
  }),

  upsertDraft: c.upsertDraft
    .use(requireAuth)
    .handler(async ({ input: { id: bookId, ...input }, errors }) => {
      if (bookId && !(await getBook(bookId))) never(errors.NOT_FOUND());

      return upsertDraftBook({ bookId, ...input });
    }),

  applyDraft: c.applyDraft
    .use(requireAuth)
    .handler(async ({ input, errors }) => {
      return applyDraftBook(input.uuid).catch(
        createErrorHandler().catch(DraftBookNotFound, () =>
          never(errors.NOT_FOUND()),
        ),
      );
    }),

  discardDraft: c.discardDraft
    .use(requireAuth)
    .handler(async ({ input, errors }) => {
      await upsertDraftBook({
        ...((await getActiveDraftBook(input.id))?.data ??
          never(errors.NOT_FOUND())),
        deletedAt: new Date(),
      });
    }),
});
