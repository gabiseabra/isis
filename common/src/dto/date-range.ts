import z from "zod";

export const DateRange = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((range) => !range.from || !range.to || range.from < range.to, {
    message: "O intervalo de tempo precisa ser positivo.",
  });

export type DateRange = z.infer<typeof DateRange>;
