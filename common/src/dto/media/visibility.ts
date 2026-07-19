import z from "zod";

export const MediaVisibility = z.enum(["public", "private"]);

export type MediaVisibility = z.infer<typeof MediaVisibility>;
