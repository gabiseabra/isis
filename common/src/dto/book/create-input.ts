import z from "zod";
import { Book } from "../book";

export const CreateBookInput = Book.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateBookInput = z.infer<typeof CreateBookInput>;
