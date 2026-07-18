import { DraftBook } from "@isis/common/dto/book/draft";
import { BookInput } from "@isis/common/dto/book/input";
import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { entries } from "@isis/common/utils/object";
import { unit } from "../../../db/unit";
import { createSheetFromJson } from "../../sheets/create-from-json";
import { bulkUpsertSheetCell } from "../../sheets/db";
import { getBook } from "../db";
import { BookInputUnprocessable, BookNotFound } from "../errors";
import { ensureDraftBookColumns } from "./columns";
import { upsertDraftBookMetadata } from "./db";
import { getActiveDraftBook } from "./get";
import { validateDraftBook } from "./validate";

/**
 * Create or update draft by book id.
 * Writes the data to draft cells if input validates.
 */
export async function upsertDraftBook(
  bookId: ID<"Book">,
  input: BookInput,
): Promise<
  DraftBook & {
    data: BookInput;
  }
> {
  const [book, existingDraft] = await Promise.all([
    getBook(bookId).then((book) => book ?? never(new BookNotFound())),
    getActiveDraftBook(bookId),
  ]);

  // validation

  const { data, errors } = await validateDraftBook(book, input);

  if (NonEmpty.isNonEmpty(errors)) {
    never(new BookInputUnprocessable());
  }

  // mutation

  return unit(async () => {
    const { sheetId, rowId } =
      existingDraft ?? (await createSheetFromJson(bookId, [], [book])).rows[0];

    const draftData = await upsertDraftBookMetadata({
      bookId,
      sheetId,
      rowId,
    });

    const columns = await ensureDraftBookColumns(sheetId);

    const _cells = entries(columns).map(([key, col]) => ({
      rowId,
      columnId: col.columnId,
      value: input[key],
    }));
    const cells = NonEmpty.isNonEmpty(_cells)
      ? await bulkUpsertSheetCell({
          sheetId,
          cells: _cells,
        })
      : [];

    return {
      ...draftData,
      data,
      errors,
      columns,
      row: {
        sheetId,
        rowId,
        cells,
      },
    };
  });
}
