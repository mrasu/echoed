import { patchFetch } from "@/fetchPatch";
import { TRACEPARENT_HEADER_KEY } from "@/integration/common/commonFetchRunner";
import { Logger } from "@/logger";
import { MockFileLogger } from "@/testUtil/fileLog/mockFileLogger";
import { DummyFetcher } from "@/testUtil/global/dummyFetcher";
import type { Global } from "@jest/types";

beforeEach(() => {
  Logger.setEnable(false);
});

afterEach(() => {
  Logger.setEnable(true);
});

describe("patchFetch", () => {
  it("should patch fetch", async () => {
    const fetcher = new DummyFetcher();
    const globalContainer = {
      fetch: fetcher.buildFetch(),
    } as Global.Global;

    const logger = new MockFileLogger();
    patchFetch(logger, "/path/to/example.test.js", globalContainer);

    const requestUrl = "https://localhost:3000/api/v1/cart";
    const resp = await globalContainer.fetch(requestUrl);
    expect(resp.status).toBe(200);
    expect(await resp.json()).toEqual({ status: 200 });

    expect(fetcher.fetchArguments.length).toBe(1);
    expect(fetcher.fetchArguments[0][0]).toBe(requestUrl);
    const headers = fetcher.fetchArguments[0][1]!.headers as Record<
      string,
      unknown
    >;
    expect(headers[TRACEPARENT_HEADER_KEY]).toMatch(
      /00-[0-9a-f]{32}-[0-9a-f]{16}-01/,
    );
  });
});
