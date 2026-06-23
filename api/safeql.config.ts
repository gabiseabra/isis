import { defineConfig } from "@ts-safeql/eslint-plugin";

export default defineConfig({
  connections: {
    migrationsDir: "./src/db/schema",
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
