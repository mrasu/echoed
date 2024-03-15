import { buildFullConfig } from "@/testUtil/playwright/fullConfig";
import { buildFullProject } from "@/testUtil/playwright/fullProject";
import { TestInfo } from "@playwright/test";

const DEFAULT_TEST_INFO: TestInfo = {
  annotations: [],
  attachments: [],
  column: 0,
  config: buildFullConfig(),
  duration: 0,
  errors: [],
  expectedStatus: "passed",
  fn: (): void => {},
  line: 0,
  outputDir: "",
  parallelIndex: 0,
  project: buildFullProject(),
  snapshotDir: "",
  snapshotSuffix: "",
  stderr: [],
  stdout: [],
  timeout: 0,
  titlePath: [],
  attach(): Promise<void> {
    return Promise.resolve();
  },
  fail(): void {},
  fixme(): void {},
  outputPath(): string {
    return "";
  },
  setTimeout(): void {},
  skip(): void {},
  slow(): void {},
  snapshotPath(): string {
    return "";
  },
  title: "title",
  file: "file",
  repeatEachIndex: 0,
  retry: 0,
  testId: "testId",
  workerIndex: 0,
};

export function buildPlaywrightTestInfo(
  overrides: Partial<TestInfo> = {},
): TestInfo {
  const testInfo: TestInfo = {
    ...DEFAULT_TEST_INFO,
    ...overrides,
  };
  return testInfo;
}
