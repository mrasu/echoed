import { TestCase } from "@/testCase";

export class TestCaseStartInfo {
  constructor(
    public testId: string,
    public file: string,
    public name: string,
    public startTimeMillis: number,
  ) {}

  toTestCaseElement(
    status: string,
    duration: number,
    testEndTimeMillis: number,
    failureDetails: string[] | undefined,
    failureMessages: string[] | undefined,
  ): TestCase {
    return new TestCase(
      this.testId,
      this.file,
      this.name,
      this.startTimeMillis,
      status,
      duration,
      testEndTimeMillis,
      failureDetails,
      failureMessages,
    );
  }
}
