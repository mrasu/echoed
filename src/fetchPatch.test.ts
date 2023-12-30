import { patchFetch } from "@/fetchPatch";
import { Logger } from "@/logger";
import { IFileLogger } from "@/fileLog/iFileLogger";

beforeEach(() => {
  Logger.setEnable(false);
});

afterEach(() => {
  Logger.setEnable(true);
});

class DummyLogger implements IFileLogger {
  texts: string[] = [];
  async appendFileLine(text: string) {
    this.texts.push(text);
  }
}

class DummyFetcher {
  fetchArguments: [RequestInfo | URL, RequestInit?][] = [];

  buildFetch(): (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response> {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
      this.fetchArguments.push([input, init]);
      return new Response(JSON.stringify({ status: 200 }));
    };
  }
}

describe("patchFetch", () => {
  it("should patch fetch", async () => {
    const fetcher = new DummyFetcher();
    const globalContainer = {
      fetch: fetcher.buildFetch(),
    } as any;

    const logger = new DummyLogger();
    patchFetch(logger, "/path/to/example.test.js", globalContainer);

    const requestUrl = "https://localhost:3000/api/v1/cart";
    const resp = await globalContainer.fetch(requestUrl);
    expect(resp.status).toBe(200);
    expect(await resp.json()).toEqual({ status: 200 });

    expect(fetcher.fetchArguments.length).toBe(1);
    expect(fetcher.fetchArguments[0][0]).toBe(requestUrl);
    const headers = fetcher.fetchArguments[0][1]!.headers as Record<
      string,
      any
    >;
    expect(headers["traceparent"]).toMatch(/00-[0-9a-f]{32}-[0-9a-f]{16}-01/);
  });
});
