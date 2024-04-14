import { TestActionLogger } from "@/fileLog/testActionLogger";
import { RouteFetchRunner } from "@/integration/playwright/internal/hook/routeFetchRunner";
import { getTraceIdFromAPIResponse } from "@/integration/playwright/internal/util/apiResponse";
import { getLastTraceIdFromContext } from "@/integration/playwright/internal/util/browserContext";
import { MockFileLogger } from "@/testUtil/fileLog/mockFileLogger";
import { buildInitializedBrowserContext } from "@/testUtil/playwright/browserContext";
import { buildRoute } from "@/testUtil/playwright/route";
import { buildPlaywrightTestInfo } from "@/testUtil/playwright/testInfo";
import { FetchFailedLog, FetchFinishedLog, FetchStartedLog } from "@/type/log";

describe("RouteFetchRunner", () => {
  const url = "https://example.com/dummy";

  describe("run", () => {
    it("should log request and mark trace-id", async () => {
      const route = buildRoute();
      const browserContext = buildInitializedBrowserContext();

      const mockFileLogger = new MockFileLogger();
      const logger = new TestActionLogger(mockFileLogger);
      const runner = new RouteFetchRunner(logger);

      await runner.run(route, browserContext, buildPlaywrightTestInfo());

      expect(mockFileLogger.texts.length).toBe(2);
      const fetchStartedLog = FetchStartedLog.parse(
        JSON.parse(mockFileLogger.texts[0]),
      );
      expect(fetchStartedLog.testId).toBe("testId");

      const fetchFinishedLog = FetchFinishedLog.parse(
        JSON.parse(mockFileLogger.texts[1]),
      );
      expect(fetchFinishedLog.request.url).toBe(url);

      const traceId = fetchFinishedLog.traceId;
      const contextTraceId = getLastTraceIdFromContext(browserContext, url);
      expect(contextTraceId?.hexString).toBe(traceId);

      const response = route.fulfill.mock.calls[0][0]?.response;
      const responseTraceId = getTraceIdFromAPIResponse(response!);
      expect(responseTraceId?.hexString).toBe(traceId);
    });

    describe("when run after Test ended", () => {
      it("should log error", async () => {
        const route = buildRoute({
          fetch: () => {
            throw new Error("Test ended");
          },
        });
        const browserContext = buildInitializedBrowserContext();

        const mockFileLogger = new MockFileLogger();
        const logger = new TestActionLogger(mockFileLogger);
        const runner = new RouteFetchRunner(logger);

        await runner.run(route, browserContext, buildPlaywrightTestInfo());

        const fetchFinishedLog = FetchFailedLog.parse(
          JSON.parse(mockFileLogger.texts[1]),
        );
        expect(fetchFinishedLog.reason).toBe("Test ended");
      });
    });
  });
});
