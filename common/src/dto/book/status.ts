import z from "zod";

export const BookStatus = z.enum(["published", "unpublished"]);

export type BookStatus = z.infer<typeof BookStatus>;
