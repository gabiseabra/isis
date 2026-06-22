import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

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
});
