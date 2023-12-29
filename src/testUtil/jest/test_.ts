import { Test, TestContext } from "@jest/test-result";

export const DEFAULT_TEST_PATH = "/path/to/dummy.test.js";

const testContext = {} as unknown as TestContext;
const DEFAULT_TEST: Test = {
  context: testContext,
  duration: undefined,
  path: DEFAULT_TEST_PATH,
};

export function buildTest(test: Partial<Test> = {}): Test {
  return {
    ...DEFAULT_TEST,
    ...test,
  };
}
