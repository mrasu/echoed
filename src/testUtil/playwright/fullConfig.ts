import { FullConfig } from "@playwright/test/reporter";
import { undefined } from "zod";

const DEFAULT_FULL_CONFIG: FullConfig = {
  forbidOnly: false,
  fullyParallel: false,
  globalSetup: null,
  globalTeardown: null,
  globalTimeout: 0,
  grep: [],
  grepInvert: null,
  maxFailures: 0,
  metadata: undefined,
  preserveOutput: "always",
  projects: [],
  quiet: false,
  reportSlowTests: null,
  reporter: [],
  rootDir: "",
  shard: null,
  updateSnapshots: "all",
  version: "",
  webServer: null,
  workers: 0,
};

export function buildFullConfig(
  overrides: Partial<FullConfig> = {},
): FullConfig {
  const fullConfig: FullConfig = {
    ...DEFAULT_FULL_CONFIG,
    ...overrides,
  };
  return fullConfig;
}
