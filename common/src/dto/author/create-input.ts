import z from "zod";
import { Author } from "../author";

export const CreateAuthorInput = Author.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateAuthorInput = z.infer<typeof CreateAuthorInput>;
