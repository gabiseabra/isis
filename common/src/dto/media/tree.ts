import z from "zod";
import { Media } from "../media";
import { MediaFolder } from "./folder";

export const MediaEntry = z.discriminatedUnion("type", [
  MediaFolder.extend({ type: z.literal("folder") }),
  Media.extend({ type: z.literal("file") }),
]);

export type MediaEntry = z.infer<typeof MediaEntry>;

export const MediaTree = z.object({
  folder: MediaFolder.nullable(),
  breadcrumbs: MediaFolder.array(),
  entries: MediaEntry.array(),
  hasNextPage: z.boolean(),
});

export type MediaTree = z.infer<typeof MediaTree>;
