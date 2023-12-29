import { TestResult } from "@/testResult";

export interface IReportFile {
  generate(testResult: TestResult): Promise<string>;
}
