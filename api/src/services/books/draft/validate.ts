import { BookInput } from "@isis/common/dto/book/input";
import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { parseZodObject } from "@isis/common/utils/parse-zod-object";
import { getBook } from "../db";
import { BookNotFound } from "../errors";

export async function validateDraftBook(
  bookOrId: ID<"Book"> | (BookInput & { id: ID<"Book"> }),
  input: Partial<Record<keyof BookInput, unknown>>,
) {
  const book =
    (typeof bookOrId === "string" ? await getBook(bookOrId) : bookOrId) ??
    never(new BookNotFound());
  return parseZodObject(book, input, BookInput);
}
