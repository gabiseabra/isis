import z from "zod";
import { Book } from "../book";

export const DraftBook = Book.omit({
  id: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  id: Book.shape.id.optional(),
});

export type DraftBook = z.infer<typeof DraftBook>;
