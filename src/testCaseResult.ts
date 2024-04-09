import { FetchInfo } from "@/fetchInfo";

export class TestCaseResult {
  constructor(
    public testId: string,
    public file: string,
    public name: string,
    public startTimeMillis: number,
    public status: string,
    public orderedTraceIds: string[],
    public fetches: FetchInfo[],
    public duration: number,
    /**
      testEndTimeMillis is time Echoed recognize test finished at.

      Because frameworks don't provide test end time, Echoed estimate it.
      This time cannot be displayed to user or used to calculate duration due to ambiguity.
      But it guarantees the test was running while startTimeMillis to testEndTimeMillis, so it can be used to identify what event happened while testing.
     */
    public testEndTimeMillis: number,
    public failureDetails?: string[],
    public failureMessages?: string[],
  ) {}
}
