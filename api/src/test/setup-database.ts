import { never } from "@isis/common/utils/error";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { setDatabaseUrl } from "../db/client";
import { sql, sqlOne } from "../db/sql";

const databaseUrl =
  process.env.DATABASE_URL ?? never("DATABASE_URL not defined");

const rootUrl = new URL(databaseUrl);
rootUrl.pathname = "/postgres";

const getDB = (id: string) =>
  `isis_test_${crypto.createHash("sha256").update(id).digest("hex").slice(0, 32)}`;

export async function setupDatabase(id: string) {
  const testUrl = new URL(databaseUrl);
  testUrl.pathname = `/${getDB(id)}`;

  const pool = new pg.Pool({ connectionString: rootUrl.toString() });
  await pool.query(`create database ${pg.escapeIdentifier(getDB(id))}`);
  await pool.end();
  const testPool = new pg.Pool({ connectionString: testUrl.toString() });
  await testPool.query(
    await fs.readFile(path.join(__dirname, "../db/schema/schema.sql"), "utf8"),
  );
  for (const file of (
    await fs.readdir(path.join(__dirname, "../db/schema/seed"))
  ).sort()) {
    if (file.endsWith(".sql"))
      await testPool.query(
        await fs.readFile(
          path.join(__dirname, "../db/schema/seed", file),
          "utf8",
        ),
      );
  }
  await testPool.end();
  await setDatabaseUrl(testUrl.toString());
}

export async function tearDownDatabase(id: string) {
  await setDatabaseUrl(databaseUrl);
  const pool = new pg.Pool({ connectionString: rootUrl.toString() });
  await pool.query(
    `drop database if exists ${pg.escapeIdentifier(getDB(id))} with (force)`,
  );
  await pool.end();
}

export async function truncateDatabase(id: string) {
  const { db } = await sqlOne<{ db: string | null }>`
    select current_database()::text as db
  `;

  if (getDB(id) !== db) {
    throw new Error(`Refusing to truncate non-test database ${db}`);
  }

  await sql`
  truncate table books, authors, publishers, sheets, genres restart identity cascade;
  `;
}
