import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts"],
  target: "es2022",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  onSuccess: `
    rm -rf ./dist/template &&
    rm -rf ./dist/template_tmp &&
    mkdir -p ./dist/template_tmp &&
    git ls-files template | xargs -i cp --parents {} ./dist/template_tmp &&
    mv ./dist/template_tmp/template ./dist &&
    rmdir ./dist/template_tmp &&
    mv ./dist/template/jest/_gitignore ./dist/template/jest/.gitignore
    mv ./dist/template/playwright/_gitignore ./dist/template/playwright/.gitignore
  `,
});
