import { AggregatedResult } from "@jest/reporters";

const DEFAULT_AGGREGATED_RESULT: AggregatedResult = {
  numPendingTestSuites: 0,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: 0,
  numTotalTests: 0,
  openHandles: [],
  snapshot: {
    added: 0,
    didUpdate: false,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0,
  },
  startTime: 0,
  success: false,
  testResults: [],
  wasInterrupted: false,
  numFailedTests: 0,
  numFailedTestSuites: 0,
  numPassedTests: 0,
  numPassedTestSuites: 0,
  numPendingTests: 0,
};

export function buildAggregatedResult(
  overrides: Partial<AggregatedResult> = {},
): AggregatedResult {
  return { ...DEFAULT_AGGREGATED_RESULT, ...overrides };
}
