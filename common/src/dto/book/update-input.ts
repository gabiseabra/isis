import z from "zod";
import { Book } from "../book";

export const UpdateBookInput = Book.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateBookInput = z.infer<typeof UpdateBookInput>;
