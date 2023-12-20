module.exports = {
  preset: "ts-jest",
  verbose: true,
  testEnvironment: "./__scripts/testEnvironment.ts",
  reporters: [
    "default",
    [
      "./__scripts/reporter.js",
      {
        output: "report/result.html",
        /* Example configuration to ignore spans from propagation test.
        propagationTest: {
          ignore: {
            attributes: {
              "user_agent": "OtelColHttpCheck/0.1"
            }
          }
        }
        */
      }
    ],
  ],
};
