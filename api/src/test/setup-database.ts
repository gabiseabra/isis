import { never } from "@isis/common/utils/error";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { PgClient } from "../db/client";
import { sql, sqlOne } from "../db/sql";

const databaseUrl =
  process.env.DATABASE_URL ?? never("DATABASE_URL not defined");

const rootUrl = new URL(databaseUrl);
rootUrl.pathname = "/postgres";

const getDB = (id: string) =>
  `isis_test_${crypto.createHash("sha256").update(id).digest("hex").slice(0, 32)}`;

export async function setupDatabaseTest(id: string) {
  const testUrl = new URL(databaseUrl);
  testUrl.pathname = `/${getDB(id)}`;

  await PgClient.withUrl(rootUrl.toString(), async () => {
    using client = await PgClient.usePool();
    await client.query(
      `create database ${PgClient.escapeIdentifier(getDB(id))}`,
    );
  });

  await PgClient.withUrl(testUrl.toString(), async () => {
    using client = await PgClient.usePool();
    await client.query(
      await fs.readFile(
        path.join(__dirname, "../db/schema/schema.sql"),
        "utf8",
      ),
    );
    for (const file of (
      await fs.readdir(path.join(__dirname, "../db/schema/seed"))
    ).sort()) {
      if (file.endsWith(".sql"))
        await client.query(
          await fs.readFile(
            path.join(__dirname, "../db/schema/seed", file),
            "utf8",
          ),
        );
    }
  });

  await PgClient.setUrl(testUrl.toString());
}

export async function tearDownDatabaseTest(id: string) {
  await PgClient.setUrl(databaseUrl);
  await PgClient.withUrl(rootUrl.toString(), async () => {
    using client = await PgClient.usePool();
    await client.query(
      `drop database if exists ${PgClient.escapeIdentifier(getDB(id))} with (force)`,
    );
  });
}

export async function clearDatabaseTest(id: string) {
  const { db } = await sqlOne<{ db: string | null }>`
    select current_database()::text as db
  `;

  if (getDB(id) !== db) {
    throw new Error(`Refusing to truncate non-test database ${db}`);
  }

  await sql`
  truncate table books, authors, publishers, sheets, genres, media_entries restart identity cascade;
  `;
}
