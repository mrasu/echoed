import {
  getLastTraceIdFromContext,
  initializeEchoedContext,
  setTraceIdToContext,
} from "@/integration/playwright/internal/util/browserContext";
import { HexString } from "@/type/hexString";
import { BrowserContext } from "@playwright/test";

describe("setTraceIdToContext and getLastTraceIdFromContext", () => {
  let ctx: BrowserContext;
  beforeEach(() => {
    ctx = {} as BrowserContext;
    initializeEchoedContext(ctx);
  });

  it("should set traceIds", () => {
    const url = "https://example.com";
    setTraceIdToContext(ctx, url, new HexString("dummy-trace-id"));

    const traceId = getLastTraceIdFromContext(ctx, url);
    expect(traceId).toEqual(new HexString("dummy-trace-id"));
  });

  describe("when setting with the same url multiple times", () => {
    it("should return the last traceId", () => {
      const url = "https://example.com";
      setTraceIdToContext(ctx, url, new HexString("dummy-trace-id"));
      setTraceIdToContext(ctx, url, new HexString("dummy-trace-id2"));

      const traceId = getLastTraceIdFromContext(ctx, url);
      expect(traceId).toEqual(new HexString("dummy-trace-id2"));
    });
  });

  describe("when setting with different url multiple times", () => {
    it("should return traceId for the specified url", () => {
      const url1 = "https://example.com/1";
      const url2 = "https://example.com/2";
      setTraceIdToContext(ctx, url1, new HexString("dummy-trace-id1"));
      setTraceIdToContext(ctx, url2, new HexString("dummy-trace-id2"));

      const traceId1 = getLastTraceIdFromContext(ctx, url1);
      expect(traceId1).toEqual(new HexString("dummy-trace-id1"));

      const traceId2 = getLastTraceIdFromContext(ctx, url2);
      expect(traceId2).toEqual(new HexString("dummy-trace-id2"));
    });
  });
});
