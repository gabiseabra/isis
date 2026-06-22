import { sql as sqlTag } from "@ts-safeql/sql-tag";
import pg, { type QueryResultRow } from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function sql<T extends QueryResultRow = never>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  const query = sqlTag(strings, ...values);
  const { rows } = await pool.query<T>(query);
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
