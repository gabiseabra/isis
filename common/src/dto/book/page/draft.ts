import z from "zod";
import { zID } from "../../primitives";
import { ParseError, Result } from "../../result";
import { UUID } from "../../uuid";
import { BookPageInput } from "./input";

export const DraftBookPage = BookPageInput.partial()
  .omit({
    id: true,
    bookId: true,
  })
  .extend({
    uuid: UUID,
    draftBookUuid: UUID,
    pageId: zID("BookPage").optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type DraftBookPage = z.infer<typeof DraftBookPage>;

export const DraftBookPageResult = Result(ParseError).and(
  z.object({
    data: DraftBookPage,
  }),
);

export type DraftBookPageResult = z.infer<typeof DraftBookPageResult>;
