import { FetchRequestInfo } from "@/fileLog/testActionLogger";
import { setTraceIdToResponse } from "@/traceLoggingFetch";
import { Base64String } from "@/type/base64String";
import { readBodyInit, readStreamFully } from "@/util/stream";
import { generateTraceparent } from "@/util/traceparent";

export type GlobalFetch = typeof globalThis.fetch;

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
    await onStart(traceId);

    const [response, requestInfo] = await this.callAndExtractFromFetch(
      traceparent,
      input,
      init,
    );
    setTraceIdToResponse(response, traceId);

    await onFinished(traceId, requestInfo, response);

    return response;
  }

  private async callAndExtractFromFetch(
    traceparent: string,
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<[Response, FetchRequestInfo]> {
    if (input instanceof Request) {
      const clonedInput = structuredClone(input);
      clonedInput.headers.set("traceparent", traceparent);

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
      headers.set("traceparent", traceparent);
    } else if (Array.isArray(headers)) {
      headers.push(["traceparent", traceparent]);
    } else {
      headers["traceparent"] = traceparent;
    }
    clonedInit.headers = headers;

    const response = await this.originalFetch(input, clonedInit);
    return [response, requestInfo];
  }
}
