import { BookInput } from "@isis/common/dto/book/input";
import { BookStatus } from "@isis/common/dto/book/status";
import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { unit } from "../../../db/unit";
import { getBook } from "../db";
import { BookInputUnprocessable, BookNotFound } from "../errors";
import { upsertBook } from "../upsert";
import { upsertDraftBookMetadata } from "./db";
import { getActiveDraftBook } from "./get";

export async function applyDraftBook(
  bookId: ID<"Book">,
  overrides?: Partial<BookInput & { status: BookStatus }>,
) {
  const [book, draft] = await Promise.all([
    getBook(bookId).then((book) => book ?? never(new BookNotFound())),
    getActiveDraftBook(bookId),
  ]);

  if (!draft) return;
  const { data, sheetId, rowId, errors } = draft;

  if (errors.length) {
    throw new BookInputUnprocessable();
  }

  return unit(async () => {
    await upsertBook({
      id: book.id,
      ...data,
      ...overrides,
    });
    await upsertDraftBookMetadata({
      bookId,
      sheetId,
      rowId,
      appliedAt: new Date(Date.now()),
    });
  });
}

export async function discardDraftBook(bookId: ID<"Book">) {
  const draft = await getActiveDraftBook(bookId);

  if (!draft) return;
  const { sheetId, rowId } = draft;

  await upsertDraftBookMetadata({
    bookId,
    sheetId,
    rowId,
    deletedAt: new Date(Date.now()),
  });
}
