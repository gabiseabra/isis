import z from "zod";
import { Publisher } from "../publisher";

export const PublisherInput = Publisher.omit({
  createdAt: true,
  updatedAt: true,
});

export type PublisherInput = z.infer<typeof PublisherInput>;
