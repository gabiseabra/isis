/// <reference types="node" />
import { defineConfig } from "@ts-safeql/eslint-plugin";
import dotenv from "dotenv";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });
dotenv.config({
  path: `.env.${process.env.NODE_ENV ?? "development"}`,
  override: true,
  quiet: true,
});

const connectionConfig = process.env.DATABASE_URL
  ? { databaseUrl: process.env.DATABASE_URL }
  : { migrationsDir: "./src/services/db/schema" };

export default defineConfig({
  connections: {
    ...connectionConfig,
    targets: [
      { tag: "sql", transform: "{type}" },
      { tag: "sqlOne", transform: "{type}" },
    ],
    overrides: {
      types: {
        bigint: "number",
        bigserial: "number",
        int8: "number",
        uuid: "UUID",
        json: "unknown",
        jsonb: "unknown",
        ltree: {
          parameter: "LTree",
          return: "LTree",
        },
      },
    },
  },
});
