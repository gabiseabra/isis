import z from "zod";
import { MediaVisibility } from "./media/visibility";
import { zID } from "./primitives";

export const Media = z.object({
  id: zID("Media"),
  folderId: zID("MediaFolder").optional(),
  visibility: MediaVisibility,
  name: z.string(),
  originalName: z.string(),
  storageKey: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Media = z.infer<typeof Media>;
