import z from "zod";
import { zID } from "../primitives";

export const MediaEntryID = z.union([zID("MediaFolder"), zID("MediaFile")]);

export type MediaEntryID = z.infer<typeof MediaEntryID>;
