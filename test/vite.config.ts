import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  plugins: [react()],

  optimizeDeps: {
    exclude: ["@isis/admin", "@isis/web", "@isis/common"],
  },
  resolve: {
    preserveSymlinks: true,
  },
}));
