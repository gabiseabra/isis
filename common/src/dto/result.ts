import z from "zod";

export const ParseError = z.object({
  path: z.string(),
  error: z.string(),
});

export type ParseError = z.infer<typeof ParseError>;

export const SuccessResult = z.object({
  success: z.literal(true),
  errors: z.undefined(),
});

export type SuccessResult = z.infer<typeof SuccessResult>;

export const ErrorResult = <S extends z.ZodType>(error: S) =>
  z.object({
    success: z.literal(false),
    errors: error.array(),
  });

export type ErrorResult<T> = {
  success: false;
  errors: T[];
};

export const Result = (error: z.ZodType) =>
  z.discriminatedUnion("success", [SuccessResult, ErrorResult(error)]);

export type Result<T, E> = {
  data: T;
} & (SuccessResult | ErrorResult<E>);
