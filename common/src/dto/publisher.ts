import z from "zod";
import { zID } from "./primitives";

export const Publisher = z.object({
  id: zID("Publisher"),
  name: z.string(),
  imageUrl: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Publisher = z.infer<typeof Publisher>;
