import z from "zod";

export type UUID = string & { __type?: "UUID" };

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const UUID = Object.assign(
  z
    .string()
    .refine((value): value is UUID => UUID_V4.test(value)) as z.ZodType<UUID>,
  {
    create(): UUID {
      return crypto.randomUUID();
    },
  },
);
