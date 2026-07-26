import z from "zod";

export const MediaFileMetadata = z.object({
  type: z.literal("file"),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileExtension: z.string(),
  storageKey: z.string(),
});
export const MediaFolderMetadata = z.object({
  type: z.literal("folder"),
});

export const MediaMetadata = z.discriminatedUnion("type", [
  MediaFileMetadata.catchall(z.unknown()),
  MediaFolderMetadata.catchall(z.unknown()),
  z.object({ type: z.literal("unknown") }).catchall(z.unknown()),
]);

export type MediaMetadata = z.infer<typeof MediaMetadata>;
