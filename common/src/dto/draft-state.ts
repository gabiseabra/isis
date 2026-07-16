import z from "zod";
import { createRecord, keys, omit } from "../utils/object";
import { SheetColumn, SheetRow } from "./sheet";

export const DraftState = <
  T extends z.ZodRawShape & {
    id: z.ZodType;
  },
>(
  schema: z.ZodObject<T>,
) =>
  z.object({
    data: schema,
    sheet: SheetRow,
    columns: z.object(
      omit(
        createRecord(keys(schema.shape).map(String), () => SheetColumn) as {
          [k in keyof T]: typeof SheetColumn;
        },
        ["id"],
      ),
    ),
  });

export type DraftState<T extends object> = {
  columns: {
    [k in Exclude<keyof T, "id">]: SheetColumn;
  };
} & Omit<z.infer<ReturnType<typeof DraftState>>, "columns">;
