import z from "zod";
import { zID } from "../primitives";

export const MediaInput = z.object({
  parentId: zID("Media").optional(),
  name: z.string(),
  slug: z.string(),
  tags: z.string().array(),
  metadata: z.record(z.string(), z.unknown()),
  deletedAt: z.date().optional(),
});

export type MediaInput = z.infer<typeof MediaInput>;
