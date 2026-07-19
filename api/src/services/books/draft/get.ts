import { DraftBook } from "@isis/common/dto/book/draft";
import { BookInput } from "@isis/common/dto/book/input";
import { DraftState } from "@isis/common/dto/draft-state";
import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { createRecord, keys } from "@isis/common/utils/object";
import { getSheetRow } from "../../sheets/db";
import { getBook } from "../db";
import { BookNotFound } from "../errors";
import { getDraftBookColumns } from "./columns";
import { getDraftBookMetadata } from "./db";
import { validateDraftBook } from "./validate";

export async function getActiveDraftBook(bookId: ID<"Book">): Promise<
  | (DraftBook & {
      data: BookInput;
    })
  | null
> {
  const [book, draftData] = await Promise.all([
    getBook(bookId).then((book) => book ?? never(new BookNotFound())),
    getDraftBookMetadata(bookId),
  ]);
  if (!draftData) return null;
  const { sheetId, rowId } = draftData;

  const columns = await getDraftBookColumns(sheetId);
  const row = await getSheetRow({
    sheetId,
    rowId,
    columnIds: Object.values(columns)
      .filter((col) => col.columnId > 0)
      .map((col) => col.columnId),
  });

  const input = createRecord(
    keys(columns),
    (key) => DraftState.getCell({ row, columns }, key)?.value ?? undefined,
  );

  const { data, errors } = await validateDraftBook(book, input);

  return {
    ...draftData,
    data,
    row,
    columns,
    errors,
  };
}
