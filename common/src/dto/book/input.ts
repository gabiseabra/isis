import z from "zod";
import { Book } from "../book";

export const BookInput = Book.omit({
  createdAt: true,
  updatedAt: true,
});

export type BookInput = z.infer<typeof BookInput>;
