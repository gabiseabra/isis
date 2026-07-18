import z from "zod";
import { Book } from "../book";

export const BookInput = Book.omit({
  id: true,
  status: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
});

export type BookInput = z.infer<typeof BookInput>;
