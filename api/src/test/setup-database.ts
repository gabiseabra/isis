import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { setDatabaseUrl } from "../db/client";

export function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL not defined");
  const db = `isis_test_${crypto.randomUUID().replace(/-/g, "_")}`;
  const testUrl = new URL(databaseUrl);
  const rootUrl = new URL(databaseUrl);
  testUrl.pathname = `/${db}`;
  rootUrl.pathname = "/postgres";

  beforeAll(async () => {
    const pool = new pg.Pool({ connectionString: rootUrl.toString() });
    await pool.query(`create database ${pg.escapeIdentifier(db)}`);
    await pool.end();
    const testPool = new pg.Pool({ connectionString: testUrl.toString() });
    await testPool.query(
      await fs.readFile(
        path.join(__dirname, "../db/schema/schema.sql"),
        "utf8",
      ),
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
  });

  afterAll(async () => {
    await setDatabaseUrl(databaseUrl);
    const pool = new pg.Pool({ connectionString: rootUrl.toString() });
    await pool.query(
      `drop database if exists ${pg.escapeIdentifier(db)} with (force)`,
    );
    await pool.end();
  });
}
