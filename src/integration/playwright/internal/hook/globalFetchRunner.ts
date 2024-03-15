import { FetchRequestInfo, TestActionLogger } from "@/fileLog/testActionLogger";
import {
  CommonFetchRunner,
  GlobalFetch,
} from "@/integration/common/commonFetchRunner";
import { readResponseText } from "@/integration/common/util/response";
import { Base64String } from "@/type/base64String";
import { TestInfo } from "@playwright/test";

export class GlobalFetchRunner {
  private readonly testActionLogger: TestActionLogger;
  private readonly fetchRunner: CommonFetchRunner;

  constructor(testActionLogger: TestActionLogger, originalFetch: GlobalFetch) {
    this.testActionLogger = testActionLogger;
    this.fetchRunner = new CommonFetchRunner(originalFetch);
  }

  async run(
    testInfo: TestInfo,
    input: RequestInfo | URL,
    init: RequestInit | undefined,
  ): Promise<Response> {
    return await this.fetchRunner.run(
      input,
      init,
      async (traceId) => {
        await this.logFetchStarted(testInfo, traceId, new Date());
      },
      async (traceId, requestInfo, response) => {
        await this.logFetchFinished(traceId, requestInfo, response);
      },
    );
  }

  private async logFetchStarted(
    testInfo: TestInfo,
    traceId: Base64String,
    startAt: Date,
  ): Promise<void> {
    await this.testActionLogger.logFetchStarted(
      testInfo.testId,
      traceId,
      testInfo.file,
      startAt,
    );
  }

  private async logFetchFinished(
    traceId: Base64String,
    requestInfo: FetchRequestInfo,
    response: Response,
  ): Promise<void> {
    const clonedResponse = response.clone();
    const responseText = await readResponseText(clonedResponse);

    await this.testActionLogger.logFetchFinished(
      traceId,
      requestInfo,
      response.status,
      responseText,
    );
  }
}
