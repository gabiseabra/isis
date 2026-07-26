import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@isis/admin", "@isis/web", "@isis/common"],
  },
  resolve: {
    alias: {
      "@isis/common": fileURLToPath(new URL("../common/src", import.meta.url)),
    },
    preserveSymlinks: true,
  },
}));
