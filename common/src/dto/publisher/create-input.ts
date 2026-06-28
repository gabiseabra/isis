import z from "zod";
import { Publisher } from "../publisher";

export const CreatePublisherInput = Publisher.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreatePublisherInput = z.infer<typeof CreatePublisherInput>;
