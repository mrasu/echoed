import { CoverageResult } from "@/coverage/coverageResult";
import { IFile } from "@/fs/IFile";
import { TestResult } from "@/report/testResult";

export interface IReportFile {
  generate(
    testResult: TestResult,
    coverageResult: CoverageResult,
  ): Promise<IFile>;
}
