/// <reference types="node" />
import { defineConfig } from "@ts-safeql/eslint-plugin";

const connectionConfig = process.env.DATABASE_URL
  ? { databaseUrl: process.env.DATABASE_URL }
  : { migrationsDir: "./src/db/schema" };

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
      },
    },
  },
});
