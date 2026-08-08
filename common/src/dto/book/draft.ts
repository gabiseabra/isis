import z from "zod";
import { keys } from "../../utils/object";
import { DraftState } from "../draft-state";
import { zID } from "../primitives";
import { BookInput } from "./input";

export const DraftBookMetadata = z.object({
  bookId: zID("Book").optional(),
  deletedAt: z.date().optional(),
  appliedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type DraftBookMetadata = z.infer<typeof DraftBookMetadata>;

export const DraftBook = DraftState(keys(BookInput.shape)).extend(
  DraftBookMetadata.shape,
);
export type DraftBook = z.infer<typeof DraftBook>;
