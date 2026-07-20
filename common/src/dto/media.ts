import z from "zod";
import { zID } from "./primitives";

export const Media = z.object({
  id: zID("Media"),
  parentIds: zID("Media").array(),
  name: z.string(),
  slug: z.string(),
  tags: z.string().array(),
  metadata: z.record(z.string(), z.unknown()),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Media = z.infer<typeof Media>;
