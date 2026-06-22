import { never } from "@isis/common/utils/error";
import { defineConfig } from "@ts-safeql/eslint-plugin";
import "dotenv/config";

const databaseUrl =
  process.env.DATABASE_URL ??
  never("DATABASE_URL environment variable is required");

export default defineConfig({
  connections: {
    databaseUrl,
    targets: [
      { tag: "sql", transform: "{type}" },
      { tag: "sqlOne", transform: "{type}" },
    ],
  },
});
