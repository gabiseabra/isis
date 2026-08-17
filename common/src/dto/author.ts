import z from "zod";
import { zID } from "./primitives";

export const Author = z.object({
  id: zID("Author"),
  name: z.string(),
  imageUrl: z.string().optional(),
  countryCode: z.string().optional(),
  birthYear: z.number().optional(),
  deathYear: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Author = z.infer<typeof Author>;
