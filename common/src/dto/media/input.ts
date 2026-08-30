import z from "zod";
import { zID } from "../primitives";

export const MediaInput = z.object({
  id: zID("Media").optional(),
  parentId: zID("Media").optional(),
  name: z.string(),
  slug: z.string().optional(),
  tags: z.string().array(),
  metadata: z.record(z.string(), z.unknown()),
  deletedAt: z.date().optional(),
});

export type MediaInput = z.infer<typeof MediaInput>;
