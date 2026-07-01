import z from "zod";
import { Author } from "../author";

export const AuthorInput = Author.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  id: Author.shape.id.optional(),
});

export type AuthorInput = z.infer<typeof AuthorInput>;
