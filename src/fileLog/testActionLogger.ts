import { IFileLogger } from "@/fileLog/iFileLogger";
import { HexString } from "@/type/hexString";
import { FetchFailedLog, FetchFinishedLog, FetchStartedLog } from "@/type/log";
import { truncateString } from "@/util/string";

const MAX_TEXT_SIZE = 1000;

export type FetchRequestInfo = {
  url: string;
  method: string;
  body: string | null;
};

export class TestActionLogger {
  constructor(private logger: IFileLogger) {}

  async logFetchStarted(
    testId: string | undefined,
    traceId: HexString,
    testPath: string,
    startAt: Date,
  ): Promise<void> {
    const value: FetchStartedLog = {
      type: "fetchStarted",
      testId: testId,
      traceId: traceId.hexString,
      testPath: testPath,
      timeMillis: startAt.getTime(),
    };

    await this.logger.appendFileLine(JSON.stringify(value));
  }

  async logFetchFinished(
    traceId: HexString,
    requestInfo: FetchRequestInfo,
    responseStatus: number,
    responseBody: string,
  ): Promise<void> {
    const reqBody = requestInfo.body
      ? truncateString(requestInfo.body, MAX_TEXT_SIZE)
      : undefined;

    const value: FetchFinishedLog = {
      type: "fetchFinished",
      traceId: traceId.hexString,
      request: {
        url: requestInfo.url,
        method: requestInfo.method,
        body: reqBody,
      },
      response: {
        status: responseStatus,
        body: truncateString(responseBody, MAX_TEXT_SIZE),
      },
    };

    await this.logger.appendFileLine(JSON.stringify(value));
  }

  async logFetchFailed(
    traceId: HexString,
    requestInfo: FetchRequestInfo,
    reason: string,
  ): Promise<void> {
    const value: FetchFailedLog = {
      type: "fetchFailed",
      traceId: traceId.hexString,
      request: {
        url: requestInfo.url,
        method: requestInfo.method,
        body: requestInfo.body ?? undefined,
      },
      reason: reason,
    };

    await this.logger.appendFileLine(JSON.stringify(value));
  }
}
