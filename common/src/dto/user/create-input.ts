import z from "zod";
import { User } from "../user";

export const CreateUserInput = User.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string(),
});

export type CreateUserInput = z.infer<typeof CreateUserInput>;
