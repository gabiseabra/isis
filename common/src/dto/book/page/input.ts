import z from "zod";
import { zID } from "../../primitives";

export const BookPageInput = z.object({
  id: zID("BookPage").optional(),
  mediaId: zID("Media"),
  bookId: zID("Book"),
  pageNumber: z.number(),
  pageType: z.string(),
  tags: z.string().array(),
});

export type BookPageInput = z.infer<typeof BookPageInput>;
