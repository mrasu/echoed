import { FullProject } from "@playwright/test";
import { undefined } from "zod";

const DEFAULT_FULL_PROJECT: FullProject = {
  dependencies: [],
  grep: [],
  grepInvert: [],
  metadata: undefined,
  name: "",
  outputDir: "",
  repeatEach: 0,
  retries: 0,
  snapshotDir: "",
  testDir: "",
  testIgnore: [],
  testMatch: [],
  timeout: 0,
  use: {},
};

export function buildFullProject(
  overrides: Partial<FullProject> = {},
): FullProject {
  const fullProject: FullProject = {
    ...DEFAULT_FULL_PROJECT,
    ...overrides,
  };
  return fullProject;
}
