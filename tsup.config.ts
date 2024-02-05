import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/jest/reporter/index.ts",
    "src/jest/nodeEnvironment/index.ts",
    "src/create/bin.ts",
    "src/scenario/gen/index.ts",
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
    cp -r ./src/scenario/template ./dist/scenario &&
    rm -rf ./dist/create/template &&
    rm -rf ./dist/create/template_tmp &&
    mkdir -p ./dist/create/template_tmp &&
    git ls-files src/create/template | xargs -i cp --parents {} ./dist/create/template_tmp &&
    mv ./dist/create/template_tmp/src/create/template ./dist/create &&
    rmdir ./dist/create/template_tmp/src/create &&
    rmdir ./dist/create/template_tmp/src &&
    rmdir ./dist/create/template_tmp &&
    mv ./dist/create/template/_gitignore ./dist/create/template/.gitignore
  `,
});
