import z from "zod";

export const ParseError = z.object({
  path: z.string(),
  error: z.string(),
});

export type ParseError = z.infer<typeof ParseError>;

export const ParseResult = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({
    success: z.literal(false),
    errors: ParseError.array(),
  }),
]);

export type ParseResult = z.infer<typeof ParseResult>;
