import { DraftBook } from "@isis/common/dto/book/draft";
import { BookInput } from "@isis/common/dto/book/input";
import { SheetColumn } from "@isis/common/dto/sheet";
import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { createRecord, keys, mapRecord, pick } from "@isis/common/utils/object";
import {
  bulkCreateSheetColumn,
  createSheetColumnRecord,
} from "../../sheets/db";

export async function getDraftBookColumns(
  sheetId: ID<"Sheet">,
): Promise<DraftBook["columns"]> {
  return mapRecord(
    await createSheetColumnRecord(
      sheetId,
      createRecord(keys(BookInput.shape), (key) => FakeBookColumn(key).target!),
    ),
    (col, key) => col ?? FakeBookColumn(key),
  );
}

export async function ensureDraftBookColumns(
  sheetId: ID<"Sheet">,
): Promise<DraftBook["columns"]> {
  const columns = await getDraftBookColumns(sheetId);
  const missingColumns = keys(BookInput.shape)
    .map((key) => columns[key])
    .filter((col) => col.columnId === -1);

  if (!NonEmpty.isNonEmpty(missingColumns)) return columns;

  const createdColumns = await bulkCreateSheetColumn({
    sheetId,
    columns: missingColumns,
  });

  return createRecord(
    keys(BookInput.shape),
    (key) => createdColumns.find((col) => col.name === key) ?? columns[key],
  );
}

const FakeBookColumn = (
  key: keyof BookInput,
): SheetColumn & { key: keyof BookInput } => ({
  key,
  sheetId: `id://Sheet/0`,
  columnId: -1,
  name: key,
  target: `Book:${key}`,
  tags: [],
});

export const draftBookColumns = keys(BookInput.shape)
  .map(FakeBookColumn)
  .map((col) => pick(col, ["name", "target", "tags", "key"]));
