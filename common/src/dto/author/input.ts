import z from "zod";
import { zID } from "../primitives";

export const AuthorInput = z.object({
  id: zID("Author").optional(),
  name: z.string().min(1, "O nome é obrigatório"),
  imageUrl: z.string().optional(),
  countryCode: z.string().length(2, "Código de país inválido").optional(),
  birthYear: z.number().optional(),
  deathYear: z.number().optional(),
});

export type AuthorInput = z.infer<typeof AuthorInput>;
