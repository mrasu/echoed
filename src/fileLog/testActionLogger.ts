import { IFileLogger } from "@/fileLog/iFileLogger";
import { Base64String } from "@/type/base64String";
import { FetchFailedLog, FetchFinishedLog, FetchStartedLog } from "@/types";
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
    traceId: Base64String,
    testPath: string,
    startAt: Date,
  ): Promise<void> {
    const value: FetchStartedLog = {
      type: "fetchStarted",
      testId: testId,
      traceId: traceId.base64String,
      testPath: testPath,
      timeMillis: startAt.getTime(),
    };

    await this.logger.appendFileLine(JSON.stringify(value));
  }

  async logFetchFinished(
    traceId: Base64String,
    requestInfo: FetchRequestInfo,
    responseStatus: number,
    responseBody: string,
  ): Promise<void> {
    const value: FetchFinishedLog = {
      type: "fetchFinished",
      traceId: traceId.base64String,
      request: {
        url: requestInfo.url,
        method: requestInfo.method,
        body: requestInfo.body ?? undefined,
      },
      response: {
        status: responseStatus,
        body: truncateString(responseBody, MAX_TEXT_SIZE),
      },
    };

    await this.logger.appendFileLine(JSON.stringify(value));
  }

  async logFetchFailed(
    traceId: Base64String,
    requestInfo: FetchRequestInfo,
    reason: string,
  ): Promise<void> {
    const value: FetchFailedLog = {
      type: "fetchFailed",
      traceId: traceId.base64String,
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
