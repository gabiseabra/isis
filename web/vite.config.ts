import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

dotenv.config({ path: "../.env" });

export default defineConfig({
  resolve: {
    alias: {
      "@isis/common": fileURLToPath(new URL("../common/src", import.meta.url)),
      "@isis/ui/styles": fileURLToPath(
        new URL("../ui/styles", import.meta.url),
      ),
      "@isis/ui": fileURLToPath(new URL("../ui/src", import.meta.url)),
    },
  },
  server: {
    port: Number(process.env.WEB_PORT ?? 6661),
  },
});
