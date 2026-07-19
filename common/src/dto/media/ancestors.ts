import z from "zod";
import { zID } from "../primitives";
import { MediaEntryID } from "./entry";

export const MediaAncestors = z.object({
  entryId: MediaEntryID,
  parentIds: zID("MediaFolder").array(),
});

export type MediaAncestors = z.infer<typeof MediaAncestors>;
