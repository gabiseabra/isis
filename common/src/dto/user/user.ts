import z from "zod";
import { ID } from "../../utils/id";

export const User = z.object({
  id: z.string().refine(ID.guard("User")),
  name: z.string(),
  email: z.string().optional(),
});

export type User = z.infer<typeof User>;
