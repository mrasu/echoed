import type { Global } from "@jest/types";
import { buildTraceLoggingFetch } from "@/traceLoggingFetch";
import { IFileLogger } from "@/fileLog/iFileLogger";

let originalFetch: (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function patchFetch(
  logger: IFileLogger,
  testPath: string,
  global: Global.Global,
) {
  const logFileFn = async (text: string) => {
    await logger.appendFileLine(text);
  };

  const customFetch = buildTraceLoggingFetch(testPath, global.fetch, logFileFn);
  originalFetch = global.fetch;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.fetch = customFetch;
}

export function restoreFetch(global: Global.Global) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.fetch = originalFetch;
}
