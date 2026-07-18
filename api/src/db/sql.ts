import { sql as sqlTag } from "@ts-safeql/sql-tag";
import pg, { type QueryResultRow } from "pg";
import { useClient } from "./client";

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

export async function sql<T extends QueryResultRow = never>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  const query = sqlTag(strings, ...values);
  using client = await useClient();
  const { rows } = await client.query<T>(query);
  return rows;
}

export async function sqlOne<T extends QueryResultRow = never>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  const rows = await sql<T>(strings, ...values);
  if (rows.length !== 1)
    throw new Error(`Expected 1 row, received ${rows.length}`);
  const row = rows[0];
  if (!row) throw new Error("Expected 1 row");
  return row;
}

export async function sqlOneMaybe<T extends QueryResultRow = never>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  const [row, ...rest] = await sql<T>(strings, ...values);
  if (!row) return null;
  if (rest.length > 0)
    throw new Error(`Expected 1 row, received ${rest.length + 1}`);
  return row;
}
