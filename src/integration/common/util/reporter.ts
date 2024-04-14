import { Config } from "@/config/config";
import { CoverageCollector } from "@/coverage/coverageCollector";
import { CoverageResult } from "@/coverage/coverageResult";
import { IFile } from "@/fs/IFile";
import { Logger } from "@/logger";
import { TestResult } from "@/report/testResult";
import { OtelSpan } from "@/type/otelSpan";
import { AnsiGreen, AnsiRed, AnsiReset } from "@/util/ansi";

export function logFileCreated(outFile: IFile): void {
  Logger.log(
    `Report file is generated at ${AnsiGreen}${outFile.path}${AnsiReset}`,
  );
}

export function logPropagationTestResult(testResult: TestResult): boolean {
  const propagationTestFailedSpans = testResult.propagationFailedSpans;
  const failedSpanLength = propagationTestFailedSpans.size;
  const testName = "Propagation test";
  if (failedSpanLength === 0) {
    Logger.log(`${AnsiGreen}✓${AnsiReset} ${testName}`);
    return true;
  }

  Logger.log(`${AnsiRed}✕${AnsiReset} ${testName}`);
  Logger.logGrayComment(`${failedSpanLength} spans lack propagation`);

  testResult.propagationFailedRootSpans.forEach((span, index) => {
    Logger.logGrayComment(`${index + 1}: ${JSON.stringify(span)}`);
  });

  return false;
}

export async function analyzeCoverage(
  config: Config,
  capturedSpans: Map<string, OtelSpan[]>,
): Promise<CoverageResult> {
  const coverageCollector =
    await CoverageCollector.createWithServiceInfo(config);

  coverageCollector.markVisited([...capturedSpans.values()].flat());
  const coverageResult = coverageCollector.getCoverage();

  return coverageResult;
}
