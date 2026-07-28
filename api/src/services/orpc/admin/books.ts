import { adminApi } from "@isis/common/orpc/admin";
import { createErrorHandler, never } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import { createBook, getBook, queryBooks } from "../../books/db";
import { getActiveDraftBook } from "../../books/draft/get";
import { applyDraftBook, discardDraftBook } from "../../books/draft/status";
import { upsertDraftBook } from "../../books/draft/upsert";
import { BookNotFound } from "../../books/errors";
import { unit } from "../../db/unit";
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
    return getActiveDraftBook(input.id).catch(
      createErrorHandler().catch(BookNotFound, () => never(errors.NOT_FOUND())),
    );
  }),

  upsertDraft: c.upsertDraft
    .use(requireAuth)
    .handler(async ({ input, errors }) => {
      if (input.id) {
        return upsertDraftBook(input.id, input).catch(
          createErrorHandler().catch(BookNotFound, () =>
            never(errors.NOT_FOUND()),
          ),
        );
      } else {
        const book = await createBook({
          ...input,
          status: "unpublished",
        });

        return upsertDraftBook(book.id, input);
      }
    }),

  applyDraft: c.applyDraft
    .use(requireAuth)
    .handler(async ({ input, errors }) => {
      await applyDraftBook(input.id).catch(
        createErrorHandler().catch(BookNotFound, () =>
          never(errors.NOT_FOUND()),
        ),
      );
      return (await getBook(input.id)) ?? never(errors.NOT_FOUND());
    }),

  discardDraft: c.discardDraft
    .use(requireAuth)
    .handler(async ({ input, errors }) => {
      await discardDraftBook(input.id).catch(
        createErrorHandler().catch(BookNotFound, () =>
          never(errors.NOT_FOUND()),
        ),
      );
    }),
});
