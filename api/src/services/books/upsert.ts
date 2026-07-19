import { Book } from "@isis/common/dto/book";
import { BookInput } from "@isis/common/dto/book/input";
import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { unit } from "../../db/unit";
import {
  addBookAuthors,
  addBookLanguages,
  createBook,
  removeBookAuthors,
  removeBookLanguages,
  updateBook,
} from "./db";

export async function upsertBook({
  id: bookId,
  ...input
}: BookInput & {
  id?: ID<"Book">;
}): Promise<Book> {
  return unit(async () => {
    const book = await (bookId
      ? updateBook({
          id: bookId,
          ...input,
        })
      : createBook({
          ...input,
          status: "unpublished",
        }));

    const [languages, authorIds] = await Promise.all([
      removeBookLanguages(book.id).then(() =>
        NonEmpty.isNonEmpty(input.languages)
          ? addBookLanguages(book.id, input.languages)
          : [],
      ),
      removeBookAuthors(book.id).then(() =>
        NonEmpty.isNonEmpty(input.authorIds)
          ? addBookAuthors(book.id, input.authorIds)
          : [],
      ),
    ]);

    return {
      ...book,
      languages,
      authorIds,
    };
  });
}
