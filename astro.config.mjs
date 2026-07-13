import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jdgaitanf.github.io",
  base: "/itinerary",
  outDir: "./dist",
  publicDir: "./public",
  server: {
    port: 3000,
  },
});