/// <reference types="node" />
import { defineConfig } from "@ts-safeql/eslint-plugin";

export default defineConfig({
  connections: {
    databaseUrl: process.env.DATABASE_URL,
    migrationsDir: process.env.DATABASE_URL ? undefined : "./src/db/schema",
    targets: [
      { tag: "sql", transform: "{type}" },
      { tag: "sqlOne", transform: "{type}" },
    ],
    overrides: {
      types: {
        bigint: "number",
        bigserial: "number",
        int8: "number",
      },
    },
  },
});
