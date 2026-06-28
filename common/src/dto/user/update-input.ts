import z from "zod";
import { User } from "../user";

export const UpdateUserInput = User.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateUserInput = z.infer<typeof UpdateUserInput>;
