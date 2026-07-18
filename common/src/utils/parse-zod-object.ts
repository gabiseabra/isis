import z from "zod";
import { createRecord, keys } from "./object";

export type ParseError<T extends PropertyKey> = {
  path: "." | T;
  error: string;
};

export function parseZodObject<S extends { [k: string]: z.ZodType }>(
  initialData: z.infer<z.ZodObject<S>> & { [k in keyof S]?: z.infer<S[k]> },
  input: Partial<Record<keyof S, unknown>>,
  schema: z.ZodObject<S>,
): {
  data: z.infer<z.ZodObject<S>>;
  errors: ParseError<keyof S>[];
} {
  const errors: ParseError<keyof S>[] = [];
  const result = schema.safeParse(
    createRecord(keys(schema.shape), (key) => {
      const result = schema.shape[key].safeParse(input[key]);
      if (result.success) return result.data;
      else {
        errors.push({
          path: key,
          error: z.prettifyError(result.error),
        });
        return initialData[key];
      }
    }),
  );

  const data = result.success ? result.data : initialData;
  if (result.error) {
    errors.push({
      path: ".",
      error: z.prettifyError(result.error),
    });
  }

  return {
    data,
    errors,
  };
}
