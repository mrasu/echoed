import { FetchRequestInfo, TestActionLogger } from "@/fileLog/testActionLogger";
import { TRACEPARENT_HEADER_KEY } from "@/integration/common/commonFetchRunner";
import {
  readAPIResponseText,
  setTraceIdToAPIResponse,
} from "@/integration/playwright/internal/util/apiResponse";
import { setTraceIdToContext } from "@/integration/playwright/internal/util/browserContext";
import { Base64String } from "@/type/base64String";
import { generateTraceparent } from "@/util/traceparent";
import { APIResponse, BrowserContext, Route, TestInfo } from "@playwright/test";

export class RouteFetchRunner {
  constructor(private testActionLogger: TestActionLogger) {}

  async run(
    route: Route,
    context: BrowserContext,
    testInfo: TestInfo,
  ): Promise<void> {
    const { traceparent, traceId } = generateTraceparent();
    await this.logFetchStarted(testInfo, traceId, new Date());

    const headers = route.request().headers();
    headers[TRACEPARENT_HEADER_KEY] = traceparent;
    const response = await this.runRouteFetch(route, headers);
    if ("fetchError" in response) {
      await this.logFetchFailed(route, traceId, response.message);
      await route.fulfill();
      return;
    }

    setTraceIdToContext(context, route.request().url(), traceId);
    setTraceIdToAPIResponse(response, traceId);

    await this.logFetchFinished(route, traceId, response);

    await route.fulfill({ response });
  }

  private async runRouteFetch(
    route: Route,
    headers?: Record<string, string>,
  ): Promise<APIResponse | { fetchError: true; message: string }> {
    try {
      return await route.fetch({ headers });
    } catch (e: unknown) {
      if (!e) throw e;
      if (!(e instanceof Error)) throw e;
      if (!e.message.includes("Test ended")) throw e;

      // Ignore fetch errors after Test ended for now.
      // Without this, `route.fetch` fail when called after test ends.
      //
      // Error is like below.
      // ```
      // Call log:
      //   - → GET http://localhost:8080/_next/static/Ya4wS-WErafYOGeBVuRfl/_ssgManifest.js
      //   -   user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.57 Safari/537.36
      //   -   accept: */*
      //   -   accept-encoding: gzip,deflate,br
      //   -   accept-language: en-US
      //   -   referer: http://localhost:8080/
      // ```
      //
      // This issue seems relates to https://github.com/microsoft/playwright/issues/28859
      //
      // Note: This error doesn't happen when using `route.continue()` instead.
      return { fetchError: true, message: "Test ended" };
    }
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

  private async logFetchFailed(
    route: Route,
    traceId: Base64String,
    reason: string,
  ): Promise<void> {
    const requestInfo: FetchRequestInfo = {
      url: route.request().url(),
      method: route.request().method(),
      body: route.request().postData(),
    };

    await this.testActionLogger.logFetchFailed(traceId, requestInfo, reason);
  }

  private async logFetchFinished(
    route: Route,
    traceId: Base64String,
    response: APIResponse,
  ): Promise<void> {
    const requestInfo: FetchRequestInfo = {
      url: route.request().url(),
      method: route.request().method(),
      body: route.request().postData(),
    };

    const responseText = await readAPIResponseText(response);
    await this.testActionLogger.logFetchFinished(
      traceId,
      requestInfo,
      response.status(),
      responseText,
    );
  }
}
