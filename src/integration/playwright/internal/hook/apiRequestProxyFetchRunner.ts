import { FetchRequestInfo, TestActionLogger } from "@/fileLog/testActionLogger";
import { TRACEPARENT_HEADER_KEY } from "@/integration/common/commonFetchRunner";
import {
  readAPIResponseText,
  setTraceIdToAPIResponse,
} from "@/integration/playwright/internal/util/apiResponse";
import { HexString } from "@/type/hexString";
import { generateTraceparent } from "@/util/traceparent";
import { APIRequestContext, APIResponse, TestInfo } from "@playwright/test";
import { Request } from "playwright-core";

export class ApiRequestProxyFetchRunner {
  constructor(private testActionLogger: TestActionLogger) {}

  async run(
    target: APIRequestContext,
    proxyReceiver: unknown,
    testInfo: TestInfo,
    urlOrRequest: string | Request,
    options: Parameters<APIRequestContext["fetch"]>[1],
  ): Promise<APIResponse> {
    if (typeof urlOrRequest === "string") {
      return await this.runUrlFetch(
        target,
        proxyReceiver,
        testInfo,
        urlOrRequest,
        options,
      );
    } else {
      return await this.runRequestFetch(
        target,
        proxyReceiver,
        urlOrRequest,
        options,
      );
    }
  }

  private async runUrlFetch(
    target: APIRequestContext,
    proxyReceiver: unknown,
    testInfo: TestInfo,
    url: string,
    options: Parameters<APIRequestContext["fetch"]>[1],
  ): Promise<APIResponse> {
    const headers = options?.headers ?? {};
    const { traceparent, traceId } = generateTraceparent();
    headers[TRACEPARENT_HEADER_KEY] = traceparent;
    const modifiedOptions = { ...options, headers };

    await this.logFetchStarted(testInfo, traceId, new Date());
    const response = await target.fetch.apply(proxyReceiver, [
      url,
      modifiedOptions,
    ]);
    setTraceIdToAPIResponse(response, traceId);
    await this.logFetchFinished(modifiedOptions, traceId, response);
    return response;
  }

  private async runRequestFetch(
    target: APIRequestContext,
    proxyReceiver: unknown,
    request: Request,
    options: Parameters<APIRequestContext["fetch"]>[1],
  ): Promise<APIResponse> {
    // No need to intercept fetch when using "Request"?
    //
    // Because Request is used when intercepting network like below. But the request is intercepted by `RouteFetchRunner` modifying `context` behavior.
    // ```ts
    // await context.route('https://www.github.com/', async route => {
    //   const response = await context.request.fetch(route.request());
    // }
    // ```
    const response = await target.fetch.apply(proxyReceiver, [
      request,
      options,
    ]);
    return response;
  }

  private async logFetchStarted(
    testInfo: TestInfo,
    traceId: HexString,
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
    options: Parameters<APIRequestContext["fetch"]>[1],
    traceId: HexString,
    response: APIResponse,
  ): Promise<void> {
    const requestInfo: FetchRequestInfo = {
      url: response.url(),
      method: options?.method ?? "GET",
      body: this.extractBodyText(options),
    };

    const responseText = await readAPIResponseText(response);
    await this.testActionLogger.logFetchFinished(
      traceId,
      requestInfo,
      response.status(),
      responseText,
    );
  }

  private extractBodyText(
    options: Parameters<APIRequestContext["fetch"]>[1],
  ): string | null {
    if (!options) return "";

    if (options.data) {
      if (typeof options.data === "string") return options.data;
      if (Buffer.isBuffer(options.data)) {
        // Limit to 1000 bytes to avoid showing large data
        return options.data.subarray(0, 1000).toString();
      }
      return JSON.stringify(options.data);
    }
    if (options.form) {
      return JSON.stringify(options.form);
    }
    if (options.multipart) {
      const bodyData: Record<string, string | number | boolean> = {};
      for (const [key, value] of Object.entries(options.multipart)) {
        if (typeof value === "string") {
          bodyData[key] = value;
        } else if (typeof value === "number") {
          bodyData[key] = value.toString();
        } else if (typeof value === "boolean") {
          bodyData[key] = value.toString();
        } else {
          bodyData[key] = "[Not displayable]";
        }
      }

      return JSON.stringify(bodyData);
    }

    return null;
  }
}
