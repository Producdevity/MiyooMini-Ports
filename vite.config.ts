import { defineConfig, type Plugin } from "vite";

import { SITE_BASE as BASE } from "./src/site.ts";

// Dev parity with the build-time pages: serve detail URLs via the shells.
const cleanDetailUrls = (): Plugin => ({
  name: "clean-detail-urls",
  configureServer(server) {
    const pattern = new RegExp(
      `^${BASE.replaceAll("/", "\\/")}(port|porter)/[^/?#]+(?:/index\\.html|/)?(?:\\?.*)?$`,
    );
    server.middlewares.use((req, _res, next) => {
      const match = req.url?.match(pattern);
      if (match) req.url = `${BASE}${match[1]}.html`;
      next();
    });
  },
});

// biome-ignore lint/style/noDefaultExport: Vite requires a default config export
export default defineConfig({
  base: BASE,
  appType: "mpa",
  plugins: [cleanDetailUrls()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: ["index.html", "porters.html", "port.html", "porter.html"],
    },
  },
});
