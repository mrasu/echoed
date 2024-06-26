import { FetchRequestInfo, TestActionLogger } from "@/fileLog/testActionLogger";
import {
  CommonFetchRunner,
  GlobalFetch,
} from "@/integration/common/commonFetchRunner";
import { readResponseText } from "@/integration/common/util/response";
import { HexString } from "@/type/hexString";

export class FetchRunner {
  private readonly testActionLogger: TestActionLogger;
  private readonly fetchRunner: CommonFetchRunner;
  private readonly testPath: string;

  constructor(
    testActionLogger: TestActionLogger,
    originalFetch: GlobalFetch,
    testPath: string,
  ) {
    this.testActionLogger = testActionLogger;
    this.fetchRunner = new CommonFetchRunner(originalFetch);
    this.testPath = testPath;
  }

  async run(
    input: RequestInfo | URL,
    init: RequestInit | undefined,
  ): Promise<Response> {
    return await this.fetchRunner.run(
      input,
      init,
      async (traceId) => {
        await this.logFetchStarted(traceId);
      },
      async (traceId, requestInfo, response) => {
        await this.logFetchFinished(traceId, requestInfo, response);
      },
    );
  }

  async logFetchStarted(traceId: HexString): Promise<void> {
    await this.testActionLogger.logFetchStarted(
      undefined,
      traceId,
      this.testPath,
      new Date(),
    );
  }

  async logFetchFinished(
    traceId: HexString,
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
