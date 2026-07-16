import z from "zod";
import { Publisher } from "../publisher";

export const DraftPublisher = Publisher.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  id: Publisher.shape.id.optional(),
});

export type DraftPublisher = z.infer<typeof DraftPublisher>;
