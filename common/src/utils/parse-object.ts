import z from "zod";
import { ParseError, ParseResult } from "../dto/parse-result";
import { createRecord, keys } from "./object";

export function parseObject<S extends { [k: string]: z.ZodType }>(
  schema: z.ZodObject<S>,
  initialData: z.infer<z.ZodObject<S>> & { [k in keyof S]?: z.infer<S[k]> },
  input: Partial<Record<keyof S, unknown>>,
): {
  data: z.infer<z.ZodObject<S>>;
} & ParseResult {
  const errors: ParseError[] = [];
  const result = schema.safeParse(
    createRecord(keys(schema.shape), (key) => {
      const result = schema.shape[key].safeParse(
        key in input ? input[key] : initialData[key],
      );
      if (result.success) return result.data;
      else {
        errors.push({
          path: String(key),
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
    success: !errors.length,
    errors,
  };
}
