module.exports = {
  preset: "ts-jest",
  verbose: true,
  rootDir: "src",
  testPathIgnorePatterns: ["<rootDir>/create/template"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
