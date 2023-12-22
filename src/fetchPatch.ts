import crypto from "crypto";
import * as path from "path";
import type { Global } from "@jest/types";
import { buildTraceLoggingFetch } from "@/traceLoggingFetch";
import { appendFileLine } from "@/util/file";

let originalFetch: (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function patchFetch(
  tmpDir: string | undefined,
  testPath: string,
  global: Global.Global,
) {
  const filename = crypto.randomUUID() + ".json";
  const filepath = tmpDir ? path.join(tmpDir, filename) : undefined;

  const logFileFn = async (text: string) => {
    if (!filepath) {
      return;
    }

    await appendFileLine(filepath, text);
  };

  const customFetch = buildTraceLoggingFetch(testPath, global.fetch, logFileFn);
  originalFetch = global.fetch;

  // @ts-ignore
  global.fetch = customFetch;
}

export function restoreFetch() {
  // @ts-ignore
  global.fetch = originalFetch;
}
