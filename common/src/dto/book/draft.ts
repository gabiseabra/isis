import z from "zod";
import { keys } from "../../utils/object";
import { DraftState } from "../draft-state";
import { zID } from "../primitives";
import { BookInput } from "./input";

export const DraftBookMetadata = z.object({
  sheetId: zID("Sheet"),
  bookId: zID("Book"),
  rowId: z.number(),
  deletedAt: z.date().nullable(),
  appliedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type DraftBookMetadata = z.infer<typeof DraftBookMetadata>;

export const DraftBook = DraftState(keys(BookInput.shape)).extend(
  DraftBookMetadata.shape,
);
export type DraftBook = z.infer<typeof DraftBook>;
