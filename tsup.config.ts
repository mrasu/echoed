import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "es2022",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  onSuccess:
    "mkdir -p ./dist/reporter/dist && cp ./reporter/dist/index.html ./dist/reporter/dist/index.html",
});
