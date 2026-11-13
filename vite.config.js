import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const devCsp = {
  name: "dev-csp",
  apply: "serve",
  transformIndexHtml: (html) => html.replace(/\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, "")
};

const devApi = {
  name: "dev-api",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const route = req.url.split("?")[0];
      if (route !== "/api/featured" && route !== "/api/join") return next();
      const mod = await server.ssrLoadModule(`/functions${route}.js`);
      const handler = mod.onRequest || mod.onRequestGet;
      if (!handler) return next();
      const out = await handler({ request: new Request(`http://localhost${req.url}`) }).catch(() => new Response("{}", { status: 502 }));
      res.statusCode = out.status;
      out.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(Buffer.from(await out.arrayBuffer()));
    });
  }
};

export default defineConfig({
  plugins: [svelte(), devCsp, devApi],
  build: { assetsDir: "app" }
});
