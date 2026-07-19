import z from "zod";
import { zID } from "../primitives";
import { MediaVisibility } from "./visibility";

export const MediaFile = z.object({
  id: zID("MediaFile"),
  folderId: zID("MediaFolder"),
  visibility: MediaVisibility,
  name: z.string(),
  originalName: z.string(),
  description: z.string().optional(),
  tags: z.string().array(),
  storageKey: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MediaFile = z.infer<typeof MediaFile>;
