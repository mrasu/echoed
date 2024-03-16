import { CoverageResult } from "@/coverage/coverageResult";
import { IFile } from "@/fs/IFile";
import { IReportFile } from "@/report/iReportFile";
import { TestResult } from "@/testResult";
import { MockFile } from "@/testUtil/fs/mockFile";

export class MockReportFile implements IReportFile {
  testResult: TestResult | undefined;
  generate(
    testResult: TestResult,
    _coverageResult: CoverageResult,
  ): Promise<IFile> {
    this.testResult = testResult;

    return Promise.resolve(new MockFile());
  }
}
