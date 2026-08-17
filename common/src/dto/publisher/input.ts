import z from "zod";
import { zID } from "../primitives";

export const PublisherInput = z.object({
  id: zID("Publisher").optional(),
  name: z.string(),
  imageUrl: z.string().optional(),
  countryCode: z.string().length(2).optional(),
});

export type PublisherInput = z.infer<typeof PublisherInput>;
