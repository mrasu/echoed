import { TestCaseResult } from "@jest/test-result";
import { DEFAULT_TEST_FULL_NAME } from "@/testUtil/jest/testCaseStartInfo";
import { DEFAULT_TEST_PATH } from "@/testUtil/jest/test_";

const DEFAULT_TEST_CASE_RESULT: TestCaseResult = {
  failureDetails: [],
  failureMessages: [],
  numPassingAsserts: 0,
  status: "passed",
  ancestorTitles: [],
  fullName: DEFAULT_TEST_PATH,
  duration: 123,
  title: DEFAULT_TEST_FULL_NAME,
};

export function buildTestCaseResult(
  test: Partial<TestCaseResult> = {},
): TestCaseResult {
  return {
    ...DEFAULT_TEST_CASE_RESULT,
    ...test,
  };
}
