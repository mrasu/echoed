import crypto from "crypto";
import { appendFileLine, hexToBase64 } from "./util";
import { FetchFinishedLog, FetchStartedLog } from "./types";
import { readBodyInit, readStreamFully } from "./stream";

type FetchType = typeof global.fetch;

type fetchRequestInfo = {
  url: string;
  method: string;
  body: string | null;
};

export function buildTraceLoggingFetch(
  testPath: string,
  origFetch: FetchType,
  logFileFn: (text: string) => Promise<void>,
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  return async function (input: RequestInfo | URL, init?: RequestInit) {
    const { traceparent, traceId } = generateTraceParent();

    await logFetchStarted(traceId);

    const [response, requestInfo] = await callAndExtractFromFetch(
      traceparent,
      input,
      init,
    );

    await logFetchFinished(traceId, requestInfo, response);

    return response;
  };

  function generateTraceParent() {
    const uuid = crypto.randomUUID();
    const traceId = uuid.replace(/-/g, "");
    const spanId = crypto.randomBytes(8).toString("hex");

    const traceparent = `00-${traceId}-${spanId}-01`;

    return { traceparent, traceId: hexToBase64(traceId) };
  }

  async function logFetchStarted(traceId: string) {
    const value: FetchStartedLog = {
      type: "fetchStarted",
      traceId: traceId,
      testPath: testPath,
      time: process.hrtime.bigint().toString(),
    };

    await logFileFn(JSON.stringify(value));
  }

  async function logFetchFinished(
    traceId: string,
    requestInfo: fetchRequestInfo,
    response: Response,
  ) {
    const clonedResponse = response.clone();

    const body = await clonedResponse.text();

    const value: FetchFinishedLog = {
      type: "fetchFinished",
      traceId: traceId,
      request: {
        url: requestInfo.url,
        method: requestInfo.method,
        body: requestInfo.body || undefined,
      },
      response: {
        status: clonedResponse.status,
        body: body,
      },
    };

    await logFileFn(JSON.stringify(value));
  }

  async function callAndExtractFromFetch(
    traceparent: string,
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<[Response, fetchRequestInfo]> {
    if (input instanceof Request) {
      const clonedInput = structuredClone(input);
      clonedInput.headers.set("traceparent", traceparent);

      const requestInfo: fetchRequestInfo = {
        url: input.url,
        method: input.method,
        body: input.body ? await readStreamFully(input.body) : null,
      };

      const response = await origFetch(clonedInput, init);
      return [response, requestInfo];
    }

    const clonedInit = init ? structuredClone(init) : {};
    const requestInfo: fetchRequestInfo = {
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

    const response = await origFetch(input, clonedInit);
    return [response, requestInfo];
  }
}
