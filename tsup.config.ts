import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/cli/bin.ts",
    "src/jest/reporter/index.ts",
    "src/jest/nodeEnvironment/index.ts",
    "src/scenario/gen/internal/jest/index.ts",
    "src/scenario/gen/jest/asserter/index.ts",
    "src/scenario/gen/jest/runner/index.ts",
  ],
  target: "es2022",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  onSuccess: `
    mkdir -p ./dist/reporter/dist &&
    cp ./reporter/dist/index.html ./dist/reporter/dist/index.html &&
    rm -rf ./dist/scenario/template &&
    mkdir -p ./dist/scenario/template &&
    cp -r ./src/scenario/template ./dist/scenario
  `,
});
