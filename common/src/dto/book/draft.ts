import z from "zod";
import { ParseResult } from "../parse-result";
import { zID } from "../primitives";
import { UUID } from "../uuid";
import { BookInput } from "./input";

export const DraftBook = BookInput.omit({
  id: true,
}).extend({
  uuid: UUID,
  bookId: zID("Book").optional(),
  appliedAt: z.date().optional(),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DraftBook = z.infer<typeof DraftBook>;

export const DraftBookResult = ParseResult.and(
  z.object({
    data: DraftBook,
  }),
);

export type DraftBookResult = z.infer<typeof DraftBookResult>;
