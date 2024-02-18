module.exports = {
  preset: "ts-jest",
  verbose: true,
  testTimeout: 30000,
  // Exclude testEnvironment and reporters in order to run tests using plain Jest.
  // testEnvironment: "echoed/jest/nodeEnvironment",
  // reporters: ["default", "echoed/jest/reporter"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
