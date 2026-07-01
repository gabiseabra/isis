import z from "zod";
import { Book } from "../book";

export const BookInput = Book.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  id: Book.shape.id.optional(),
});

export type BookInput = z.infer<typeof BookInput>;
