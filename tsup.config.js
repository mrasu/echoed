"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)({
  entry: ["src/index.ts"],
  target: "es2022",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
});
