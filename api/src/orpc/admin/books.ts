import { adminApi } from "@isis/common/orpc/admin";
import { createErrorHandler, never } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import { unit } from "../../db/unit";
import { createBook, getBook, queryBooks } from "../../services/books/db";
import { getActiveDraftBook } from "../../services/books/draft/get";
import {
  applyDraftBook,
  discardDraftBook,
} from "../../services/books/draft/status";
import { upsertDraftBook } from "../../services/books/draft/upsert";
import { BookNotFound } from "../../services/books/errors";
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

  upsertDraft: c.upsertDraft.use(requireAuth).handler(async ({ input }) => {
    if (input.id) return upsertDraftBook(input.id, input);

    return unit(async () => {
      const book = await createBook({
        status: "unpublished",
        title: input.title,
      });
      return upsertDraftBook(book.id, input);
    });
  }),

  applyDraft: c.applyDraft
    .use(requireAuth)
    .handler(async ({ input, errors }) => {
      await applyDraftBook(input.id);
      return (await getBook(input.id)) ?? never(errors.NOT_FOUND());
    }),

  discardDraft: c.discardDraft.use(requireAuth).handler(async ({ input }) => {
    await discardDraftBook(input.id);
  }),
});
