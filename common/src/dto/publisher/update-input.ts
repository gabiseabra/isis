import z from "zod";
import { Publisher } from "../publisher";

export const UpdatePublisherInput = Publisher.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdatePublisherInput = z.infer<typeof UpdatePublisherInput>;
