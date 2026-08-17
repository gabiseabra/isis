import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { applyDraftBook } from "./apply";
import { BookNotFound } from "./errors";
import { getBook, updateBook } from "./repo/books";

export async function publishBook(bookId: ID<"Book">) {
  await applyDraftBook(bookId);
  await updateBook({
    ...((await getBook(bookId)) ?? never(new BookNotFound())),
    status: "published",
  });
}

export async function unpublishBook(bookId: ID<"Book">) {
  await updateBook({
    ...((await getBook(bookId)) ?? never(new BookNotFound())),
    status: "unpublished",
  });
}
