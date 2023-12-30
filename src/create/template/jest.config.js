module.exports = {
  preset: "ts-jest",
  verbose: true,
  testTimeout: 30000,
  testEnvironment: "tobikura/jest/nodeEnvironment",
  reporters: [
    "default",
    "tobikura/jest/reporter",
  ],
};
