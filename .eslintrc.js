module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  ignorePatterns: ["/*", "!/src", "src/generated/", "src/opentelemetry-proto"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "error",
  },
  overrides: [
    {
      // Allow using "any" in gen/internal as they use "any" so often to accept any user input.
      files: ["./src/scenario/gen/internal/**/*.ts"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-return": "off",
      },
    },
  ],
  parserOptions: {
    project: true,
  },
};
