import { IFileLogger } from "@/fileLog/iFileLogger";
import { TestActionLogger } from "@/fileLog/testActionLogger";
import { TRACEPARENT_HEADER_KEY } from "@/integration/common/commonFetchRunner";
import { CypressHttpRequest } from "@/integration/cypress/internal/cypressHttpRequest";
import { CypressHttpResponse } from "@/integration/cypress/internal/cypressHttpResponse";
import { isEchoedHttpRequest } from "@/integration/cypress/internal/util/cypressRequest";
import {
  readCypressResponseText,
  setTraceIdToCypressResponse,
} from "@/integration/cypress/internal/util/cypressResponse";
import { setTraceIdToCypressSpec } from "@/integration/cypress/internal/util/cypressSpec";
import { toDisplayableRequestBody } from "@/integration/cypress/internal/util/request";
import { HexString } from "@/type/hexString";
import { generateTraceparent } from "@/util/traceparent";

export class RequestRunner {
  testActionLogger: TestActionLogger;

  constructor(
    private spec: Cypress.Spec,
    fileLogger: IFileLogger,
  ) {
    this.testActionLogger = new TestActionLogger(fileLogger);
  }

  async run(req: CypressHttpRequest): Promise<void> {
    const { traceparent, traceId } = generateTraceparent();

    const isEchoedRequest = isEchoedHttpRequest(req);

    if (!isEchoedRequest) {
      await this.logFetchStarted(traceId);
    }

    req.headers[TRACEPARENT_HEADER_KEY] = traceparent;
    setTraceIdToCypressSpec(this.spec, req.url, traceId);

    req.on("response", async (res): Promise<void> => {
      setTraceIdToCypressResponse(res, traceId);

      if (!isEchoedRequest) {
        await this.logFetchFinished(traceId, req, res);
      }
    });
  }

  private async logFetchStarted(traceId: HexString): Promise<void> {
    await this.testActionLogger.logFetchStarted(
      undefined,
      traceId,
      this.spec.relative,
      new Date(),
    );
  }

  private async logFetchFinished(
    traceId: HexString,
    req: CypressHttpRequest,
    res: CypressHttpResponse,
  ): Promise<void> {
    const responseText = readCypressResponseText(res);

    await this.testActionLogger.logFetchFinished(
      traceId,
      {
        url: req.url,
        method: req.method,
        body: toDisplayableRequestBody(req.body),
      },
      res.statusCode,
      responseText,
    );
  }
}
