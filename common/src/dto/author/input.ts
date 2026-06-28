import z from "zod";
import { Author } from "../author";

export const AuthorInput = Author.omit({
  createdAt: true,
  updatedAt: true,
});

export type AuthorInput = z.infer<typeof AuthorInput>;
