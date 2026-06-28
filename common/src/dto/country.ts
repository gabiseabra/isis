import z from "zod";

export const Country = z.object({
  code: z.string().length(2),
  name: z.string(),
});

export type Country = z.infer<typeof Country>;
