import z from "zod";
import { zID } from "../primitives";

export const MediaChildren = z.object({
  entryId: zID("MediaEntry"),
  childrenIds: zID("MediaEntry").array(),
  hasNextPage: z.boolean(),
});

export type MediaChildren = z.infer<typeof MediaChildren>;
