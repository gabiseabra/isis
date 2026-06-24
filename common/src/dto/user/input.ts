import z from "zod";

export const UserInput = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export type UserInput = z.infer<typeof UserInput>;
