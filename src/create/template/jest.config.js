module.exports = {
  preset: "ts-jest",
  verbose: true,
  testEnvironment: "tobikura/jest/nodeEnvironment",
  reporters: [
    "default",
    [
      "tobikura/jest/reporter",
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
