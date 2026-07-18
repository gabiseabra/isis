import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { getBook, updateBook } from "./db";
import { applyDraftBook } from "./draft/status";
import { BookNotFound } from "./errors";

export async function publishBook(bookId: ID<"Book">) {
  await applyDraftBook(bookId, {
    status: "published",
  });
}

export async function unpublishBook(bookId: ID<"Book">) {
  await updateBook({
    ...((await getBook(bookId)) ?? never(new BookNotFound())),
    status: "unpublished",
  });
}
