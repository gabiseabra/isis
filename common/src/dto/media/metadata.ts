import z from "zod";

export const MediaFileMetadata = z.object({
  originalName: z.string().optional(),
  description: z.string().optional(),
  storageKey: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
});
export const MediaFolderMetadata = z.object({});

export const MediaMetadata = z.discriminatedUnion("type", [
  MediaFileMetadata.extend({
    type: z.literal("file"),
  }),
  MediaFolderMetadata.extend({
    type: z.literal("folder"),
  }),
]);

export type MediaMetadata = z.infer<typeof MediaMetadata>;
