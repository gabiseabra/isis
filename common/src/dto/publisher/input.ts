import z from "zod";
import { Publisher } from "../publisher";

export const PublisherInput = Publisher.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  id: Publisher.shape.id.optional(),
});

export type PublisherInput = z.infer<typeof PublisherInput>;
