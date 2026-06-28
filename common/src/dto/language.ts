import z from "zod";

export const Language = z.object({
  code: z.string().length(2),
  name: z.string(),
});

export type Language = z.infer<typeof Language>;
