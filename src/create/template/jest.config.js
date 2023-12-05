module.exports = {
  preset: "ts-jest",
  verbose: true,
  testEnvironment: "./__scripts/testEnvironment.ts",
  reporters: [
    "default",
    ["./__scripts/reporter.js", { output: "dist/report.html" }],
  ],
};
