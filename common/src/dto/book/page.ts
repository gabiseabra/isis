import z from "zod";
import { zID } from "../primitives";

export const BookPage = z.object({
  id: zID("BookPage"),
  mediaId: zID("Media"),
  bookId: zID("Book"),
  pageNumber: z.number(),
  pageType: z.string(),
  tags: z.string().array(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BookPage = z.infer<typeof BookPage>;
