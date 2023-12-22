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
    public failureDetails?: string[],
    public failureMessages?: string[],
    public duration?: number,
  ) {}
}
