import z from "zod";
import { ID } from "../utils/id";

export const zID = <T extends string>(namespace: T) =>
  z.string().refine(ID.guard(namespace));
