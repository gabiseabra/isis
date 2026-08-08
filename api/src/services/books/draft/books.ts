import { DraftBook } from "@isis/common/dto/book/draft";
import { BookInput } from "@isis/common/dto/book/input";
import { never } from "@isis/common/utils/error";
import { DraftFactory } from "../../sheets/draft-factory";
import { getBook } from "../db";
import { BookNotFound } from "../errors";
import { getActiveDraftBookMetadata, getDraftBookMetadata } from "./db";

export const DraftBooks = new DraftFactory<BookInput, DraftBook>({
  inputSchema: BookInput,
  columnTarget: (key) => `Book:${key}`,
  async getInitialData(bookId) {
    return (await getBook(bookId)) ?? never(new BookNotFound());
  },
  getDraftData() {
    never("??");
  },
  getActiveDraftData(bookId) {
    return getActiveDraftBookMetadata(bookId);
  },
  upsertDraftData(input) {
    never("??");
  },
});
