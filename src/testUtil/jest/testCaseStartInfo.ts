import { Circus } from "@jest/types";

export const DEFAULT_TEST_FULL_NAME = "some awesome test";

const DEFAULT_TEST_CASE_START_INFO: Circus.TestCaseStartInfo = {
  ancestorTitles: [],
  fullName: DEFAULT_TEST_FULL_NAME,
  mode: undefined,
  title: "test",
  startedAt: 1234,
};

export function buildTestCaseStartInfo(
  test: Partial<Circus.TestCaseStartInfo> = {},
): Circus.TestCaseStartInfo {
  return {
    ...DEFAULT_TEST_CASE_START_INFO,
    ...test,
  };
}
