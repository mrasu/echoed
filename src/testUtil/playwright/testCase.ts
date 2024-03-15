import { TestCase } from "playwright/types/testReporter";

export const DEFAULT_TEST_PATH = "/path/to/dummy.test.js";

const DEFAULT_TEST_CASE: TestCase = {
  annotations: [],
  expectedStatus: "passed",
  id: "1-1",
  location: {
    column: 0,
    file: DEFAULT_TEST_PATH,
    line: 0,
  },
  parent: {
    project: function (): undefined {},
    allTests: function (): TestCase[] {
      return [];
    },
    titlePath: function (): string[] {
      return [];
    },
    suites: [],
    tests: [],
    title: "",
  },
  repeatEachIndex: 0,
  results: [],
  retries: 0,
  timeout: 0,
  title: "myTestCase",
  ok(): boolean {
    return false;
  },
  outcome(): "skipped" | "expected" | "unexpected" | "flaky" {
    return "expected";
  },
  titlePath(): Array<string> {
    return ["testUtil", "myTestCase"];
  },
};

export function buildPlaywrightTestCase(
  overrides: Partial<TestCase> = {},
): TestCase {
  const test: TestCase = {
    ...DEFAULT_TEST_CASE,
    ...overrides,
  };

  return test;
}
