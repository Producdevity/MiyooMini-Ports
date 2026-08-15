import { defineConfig } from "vite";

// biome-ignore lint/style/noDefaultExport: Vite requires a default config export
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: ["index.html", "porters.html"],
    },
  },
});
