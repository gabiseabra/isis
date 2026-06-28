import z from "zod";
import { ID } from "../utils/id";

export const Publisher = z.object({
  id: z.string().refine(ID.guard("Publisher")),
  name: z.string(),
  imageUrl: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Publisher = z.infer<typeof Publisher>;
