import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://tu-usuario.github.io/itinerary-app",
  base: "/itinerary-app",
  outDir: "./dist",
  publicDir: "./public",
  server: {
    port: 3000,
  },
});
