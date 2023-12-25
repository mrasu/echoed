import { FetchInfo } from "@/fetchInfo";
import { TestCaseResult } from "@/testCaseResult";

export class TestCase {
  constructor(
    public testId: string,
    public file: string,
    public name: string,
    public startTimeMillis: number,
    public status: string,
    public duration: number,
    public failureDetails?: string[],
    public failureMessages?: string[],
  ) {}

  get finishTimeMillis(): number {
    return this.startTimeMillis + this.duration;
  }

  toResult(orderedTraceIds: string[], fetches: FetchInfo[]): TestCaseResult {
    return new TestCaseResult(
      this.testId,
      this.file,
      this.name,
      this.startTimeMillis,
      this.status,
      orderedTraceIds,
      fetches,
      this.duration,
      this.failureDetails,
      this.failureMessages,
    );
  }
}
