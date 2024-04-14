import { IFileLogger } from "@/fileLog/iFileLogger";
import { TestActionLogger } from "@/fileLog/testActionLogger";
import { FetchRunner } from "@/integration/jest/internal/fetchRunner";
import type { Global } from "@jest/types";

let originalFetch: (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function patchFetch(
  logger: IFileLogger,
  testPath: string,
  global: Global.Global,
): void {
  const testActionLogger = new TestActionLogger(logger);

  const fetchRunner = new FetchRunner(testActionLogger, global.fetch, testPath);
  const customFetch = async (
    input: Request | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    return fetchRunner.run(input, init);
  };
  originalFetch = global.fetch;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.fetch = customFetch;
}

export function restoreFetch(global: Global.Global): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.fetch = originalFetch;
}
