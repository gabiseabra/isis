import { BookInput } from "@isis/common/dto/book/input";
import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { applyDraftBook } from "./apply";
import { BookNotFound } from "./errors";
import { getBook, updateBook } from "./repo/books";

export async function publishBook(bookId: ID<"Book">) {
  await applyDraftBook(bookId);

  const { publisher, ...input } = BookInput.fromBook(
    (await getBook(bookId)) ?? never(new BookNotFound()),
  );

  await updateBook({
    ...input,
    id: bookId,
    status: "unpublished",
    publisherId: publisher?.id ?? null,
  });
}

export async function unpublishBook(bookId: ID<"Book">) {
  const { publisher, ...input } = BookInput.fromBook(
    (await getBook(bookId)) ?? never(new BookNotFound()),
  );

  return await updateBook({
    ...input,
    id: bookId,
    status: "unpublished",
    publisherId: publisher?.id ?? null,
  });
}
