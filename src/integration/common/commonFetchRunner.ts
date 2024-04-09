import { FetchRequestInfo } from "@/fileLog/testActionLogger";
import { ECHOED_USER_AGENT, USER_AGENT_HEADER_KEY } from "@/server/request";
import { setTraceIdToResponse } from "@/traceLoggingFetch";
import { Base64String } from "@/type/base64String";
import { readBodyInit, readStreamFully } from "@/util/stream";
import { generateTraceparent } from "@/util/traceparent";

export type GlobalFetch = typeof globalThis.fetch;
export const TRACEPARENT_HEADER_KEY = "traceparent";

export class CommonFetchRunner {
  constructor(private readonly originalFetch: GlobalFetch) {}

  async run(
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    onStart: (traceId: Base64String) => Promise<void>,
    onFinished: (
      traceId: Base64String,
      requestInfo: FetchRequestInfo,
      response: Response,
    ) => Promise<void>,
  ): Promise<Response> {
    const { traceparent, traceId } = generateTraceparent();

    const isEchoedRequest = this.hasEchoedUserAgent(init?.headers);
    if (!isEchoedRequest) {
      await onStart(traceId);
    }

    const [response, requestInfo] = await this.callAndExtractFromFetch(
      traceparent,
      input,
      init,
    );
    setTraceIdToResponse(response, traceId);

    if (!isEchoedRequest) {
      await onFinished(traceId, requestInfo, response);
    }

    return response;
  }

  private async callAndExtractFromFetch(
    traceparent: string,
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<[Response, FetchRequestInfo]> {
    if (input instanceof Request) {
      const clonedInput = structuredClone(input);
      clonedInput.headers.set(TRACEPARENT_HEADER_KEY, traceparent);

      const requestInfo: FetchRequestInfo = {
        url: input.url,
        method: input.method,
        body: input.body ? await readStreamFully(input.body) : null,
      };

      const response = await this.originalFetch(clonedInput, init);
      return [response, requestInfo];
    }

    const clonedInit = init ? structuredClone(init) : {};
    const requestInfo: FetchRequestInfo = {
      url: input.toString(),
      method: init?.method || "GET",
      body: init?.body ? await readBodyInit(init.body) : null,
    };

    const headers = clonedInit.headers || {};
    if (headers instanceof Headers) {
      headers.set(TRACEPARENT_HEADER_KEY, traceparent);
    } else if (Array.isArray(headers)) {
      headers.push([TRACEPARENT_HEADER_KEY, traceparent]);
    } else {
      headers[TRACEPARENT_HEADER_KEY] = traceparent;
    }
    clonedInit.headers = headers;

    const response = await this.originalFetch(input, clonedInit);
    return [response, requestInfo];
  }

  private hasEchoedUserAgent(headers: HeadersInit | undefined): boolean {
    if (!headers) return false;
    if (typeof headers !== "object") return false;

    for (const [key, value] of Object.entries(headers)) {
      if (key === USER_AGENT_HEADER_KEY && value === ECHOED_USER_AGENT) {
        return true;
      }
    }

    return false;
  }
}
