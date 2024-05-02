import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/cli/bin.ts",
    "src/integration/cypress/nodeEvents/index.ts",
    "src/integration/cypress/reporter/index.ts",
    "src/integration/cypress/support/index.ts",
    "src/integration/jest/reporter/index.ts",
    "src/integration/jest/nodeEnvironment/index.ts",
    "src/integration/playwright/index.ts",
    "src/integration/playwright/globalSetup/index.ts",
    "src/integration/playwright/reporter/index.ts",
    "src/integration/playwright/test/index.ts",
    "src/integration/playwright/test/wrapper/index.ts",
    "src/scenario/gen/internal/jest/index.ts",
    "src/scenario/gen/internal/playwright/index.ts",
    "src/scenario/gen/jest/asserter/index.ts",
    "src/scenario/gen/jest/runner/index.ts",
    "src/scenario/gen/playwright/runner/index.ts",
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
