import { adminApi } from "@isis/common/orpc/admin";
import { createErrorHandler, never } from "@isis/common/utils/error";
import { implement } from "@orpc/server";
import { applyDraftBook } from "../../../books/apply";
import { DraftBookNotFound } from "../../../books/errors";
import { getDraftBookResult } from "../../../books/get-draft";
import { getBook } from "../../../books/repo/books";
import {
  deleteDraftBook,
  getActiveDraftBook,
  upsertDraftBook,
} from "../../../books/repo/drafts";
import { ORPCContext } from "../../context";
import { requireAuth } from "../../middleware/auth";

const c = implement(adminApi.books.drafts).$context<ORPCContext>();

export const bookDrafts = c.router({
  get: c.get.use(requireAuth).handler(async ({ input, errors }) => {
    if (!(await getBook(input.id))) never(errors.NOT_FOUND());

    return getDraftBookResult(input);
  }),

  upsert: c.upsert
    .use(requireAuth)
    .handler(async ({ input: { id: bookId, ...input }, errors }) => {
      if (bookId && !(await getBook(bookId))) never(errors.NOT_FOUND());

      const { uuid } = await upsertDraftBook({
        uuid: null,
        bookId: bookId ?? null,
        title: input.title ?? null,
        slug: input.slug ?? null,
        tags: input.tags,
        isbn13: input.isbn13 ?? null,
        isbn10: input.isbn10 ?? null,
        imageUrl: input.imageUrl ?? null,
        publishYear: input.publishYear ?? null,
        publisher: input.publisher ?? null,
        authors: input.authors ?? null,
        languages: input.languages ?? null,
        appliedAt: null,
      });

      return (await getDraftBookResult({ uuid })) ?? never("??");
    }),

  apply: c.apply.use(requireAuth).handler(async ({ input, errors }) => {
    return applyDraftBook(input.uuid).catch(
      createErrorHandler().catch(DraftBookNotFound, () =>
        never(errors.NOT_FOUND()),
      ),
    );
  }),

  delete: c.delete.use(requireAuth).handler(async ({ input, errors }) => {
    const draft =
      (await getActiveDraftBook(input.id)) ?? never(errors.NOT_FOUND());

    await deleteDraftBook(draft.uuid);
  }),
});
