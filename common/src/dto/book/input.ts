import z from "zod";
import { Book } from "../book";

export const BookInput = Book.omit({
  status: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  id: true,
});

export type BookInput = z.infer<typeof BookInput>;
