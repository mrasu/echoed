import { AnsiGreen, AnsiRed, AnsiReset } from "@/ansi";
import { IFile } from "@/fs/IFile";
import { Logger } from "@/logger";
import { TestResult } from "@/testResult";

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
