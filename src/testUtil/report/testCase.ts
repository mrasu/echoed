import { TestCase } from "@/testCase";

const DEFAULT_TEST_CASE = {
  testId: "testId",
  file: "file",
  name: "name",
  startTimeMillis: 1234,
  status: "status",
  duration: 1234,
  testEndTimeMillis: 1234,
};

export function buildTestCase(overrides: Partial<TestCase> = {}): TestCase {
  const vals = {
    ...DEFAULT_TEST_CASE,
    ...overrides,
  };
  return new TestCase(
    vals.testId,
    vals.file,
    vals.name,
    vals.startTimeMillis,
    vals.status,
    vals.duration,
    vals.testEndTimeMillis,
    vals.failureDetails,
    vals.failureMessages,
  );
}
