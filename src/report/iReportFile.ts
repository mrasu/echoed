import { TestResult } from "@/testResult";
import { CoverageResult } from "@/coverage/coverageResult";

export interface IReportFile {
  generate(
    testResult: TestResult,
    coverageResult: CoverageResult,
  ): Promise<string>;
}
