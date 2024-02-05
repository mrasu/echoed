import { CoverageResult } from "@/coverage/coverageResult";
import { TestResult } from "@/testResult";

export interface IReportFile {
  generate(
    testResult: TestResult,
    coverageResult: CoverageResult,
  ): Promise<string>;
}
