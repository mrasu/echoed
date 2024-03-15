import { TestResult } from "playwright/types/testReporter";

const DEFAULT_TEST_RESULT: TestResult = {
  attachments: [],
  duration: 123,
  error: undefined,
  errors: [],
  parallelIndex: 0,
  retry: 0,
  startTime: new Date(),
  status: "passed",
  stderr: [],
  stdout: [],
  steps: [],
  workerIndex: 0,
};

export function buildPlaywrightTestResult(
  overrides: Partial<TestResult> = {},
): TestResult {
  const result: TestResult = {
    ...DEFAULT_TEST_RESULT,
    ...overrides,
  };

  return result;
}

export function makeTestResultFailed(result: TestResult): TestResult {
  return {
    ...result,
    status: "failed",
    errors: [
      {
        location: {
          file: "dummyFile",
          line: 1,
          column: 1,
        },
        message: "test failed",
        snippet: "snippet",
        stack: "stack",
        value: "value",
      },
    ],
  };
}
