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
    public failureDetails?: string[],
    public failureMessages?: string[],
  ) {}
}
