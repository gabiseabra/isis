import z from "zod";
import { Author } from "../author";

export const UpdateAuthorInput = Author.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateAuthorInput = z.infer<typeof UpdateAuthorInput>;
