import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },
});
