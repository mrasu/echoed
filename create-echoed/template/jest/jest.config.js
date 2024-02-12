module.exports = {
  preset: "ts-jest",
  verbose: true,
  testTimeout: 30000,
  testEnvironment: "echoed/jest/nodeEnvironment",
  reporters: ["default", "echoed/jest/reporter"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
