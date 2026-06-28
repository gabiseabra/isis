import z from "zod";
import { ID } from "../utils/id";

export const Author = z.object({
  id: z.string().refine(ID.guard("Author")),
  name: z.string(),
  imageUrl: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  birthYear: z.number().optional(),
  deathYear: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Author = z.infer<typeof Author>;
