import z from "zod";
import { zID } from "../primitives";
import { MediaEntryID } from "./entry";

export const MediaChildren = z.object({
  folderId: zID("MediaFolder").nullable(),
  childIds: MediaEntryID.array(),
  hasNextPage: z.boolean(),
});

export type MediaChildren = z.infer<typeof MediaChildren>;
