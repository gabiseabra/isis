import z from "zod";
import { zID } from "../primitives";
import { MediaVisibility } from "./visibility";

export const MediaEntry = z.object({
  id: zID("MediaEntry"),
  parentId: zID("MediaEntry").optional(),
  name: z.string(),
  slug: z.string(),
  path: z.string(),
  tags: z.string().array(),
  visibility: MediaVisibility,
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MediaEntry = z.infer<typeof MediaEntry>;
