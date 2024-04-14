import { FetchInfo } from "@/fetchInfo";
import { TestCase } from "@/type/testCase";

export class TestCaseResult {
  constructor(
    private testCase: TestCase,
    readonly orderedTraceIds: string[],
    readonly fetches: FetchInfo[],
  ) {}

  get testId(): string {
    return this.testCase.testId;
  }

  get file(): string {
    return this.testCase.file;
  }

  get name(): string {
    return this.testCase.name;
  }

  get startTimeMillis(): number {
    return this.testCase.startTimeMillis;
  }

  get status(): string {
    return this.testCase.status;
  }

  get duration(): number {
    return this.testCase.duration;
  }

  get failureDetails(): string[] | undefined {
    return this.testCase.failureDetails;
  }

  get failureMessages(): string[] | undefined {
    return this.testCase.failureMessages;
  }
}
