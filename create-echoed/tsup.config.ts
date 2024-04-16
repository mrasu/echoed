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
    git ls-files template | grep -v base/example/opentelemetry-demo | xargs -i cp --parents {} ./dist/template_tmp &&
    cp --parents -r template/base/example/opentelemetry-demo ./dist/template_tmp &&
    cp --parents -r template/base/example/opentelemetry-demo-override ./dist/template_tmp &&
    rm -r ./dist/template_tmp/template/base/example/opentelemetry-demo/test &&
    rm -r ./dist/template_tmp/template/base/example/opentelemetry-demo/src/frontend/cypress &&
    rm ./dist/template_tmp/template/base/example/opentelemetry-demo/src/frontend/cypress.config.ts &&
    cp -Tr ./dist/template_tmp/template/base/example/opentelemetry-demo-override ./dist/template_tmp/template/base/example/opentelemetry-demo &&
    rm -r ./dist/template_tmp/template/base/example/opentelemetry-demo-override &&
    mv ./dist/template_tmp/template ./dist &&
    rmdir ./dist/template_tmp &&
    mv ./dist/template/cypress/_gitignore ./dist/template/cypress/.gitignore &&
    mv ./dist/template/jest/_gitignore ./dist/template/jest/.gitignore &&
    mv ./dist/template/playwright/_gitignore ./dist/template/playwright/.gitignore
  `,
});
