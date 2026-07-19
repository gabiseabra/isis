import z from "zod";
import { zID } from "../primitives";

export const MediaFolder = z.object({
  id: zID("MediaFolder"),
  parentId: zID("MediaFolder").optional(),
  hidden: z.boolean(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MediaFolder = z.infer<typeof MediaFolder>;
