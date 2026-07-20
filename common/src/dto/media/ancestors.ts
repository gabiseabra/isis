import z from "zod";
import { zID } from "../primitives";

export const MediaAncestors = z.object({
  entryId: zID("MediaEntry"),
  parentIds: zID("MediaEntry").array(),
});

export type MediaAncestors = z.infer<typeof MediaAncestors>;
