import { TestActionLogger } from "@/fileLog/testActionLogger";
import { GlobalFetch } from "@/integration/common/commonFetchRunner";
import { GlobalFetchRunner } from "@/integration/playwright/internal/hook/globalFetchRunner";
import { MockFileLogger } from "@/testUtil/fileLog/mockFileLogger";
import { DummyFetcher } from "@/testUtil/global/dummyFetcher";
import { buildPlaywrightTestInfo } from "@/testUtil/playwright/testInfo";
import { getTraceIdFromResponse } from "@/traceLoggingFetch";
import { FetchFinishedLog, FetchStartedLog } from "@/type/log";

describe("GlobalFetchRunner", () => {
  describe("run", () => {
    const url = "https://example.com/dummy";

    it("should log start and end", async () => {
      const mockFileLogger = new MockFileLogger();
      const logger = new TestActionLogger(mockFileLogger);
      const fetcher = new DummyFetcher();
      const runner = new GlobalFetchRunner(
        logger,
        fetcher.buildFetch() as GlobalFetch,
      );

      const response = await runner.run(
        buildPlaywrightTestInfo({
          testId: "testId",
        }),
        url,
        {},
      );

      expect(mockFileLogger.texts.length).toBe(2);
      const fetchStartedLog = FetchStartedLog.parse(
        JSON.parse(mockFileLogger.texts[0]),
      );
      expect(fetchStartedLog.testId).toBe("testId");

      const fetchFinishedLog = FetchFinishedLog.parse(
        JSON.parse(mockFileLogger.texts[1]),
      );
      expect(fetchFinishedLog.request.url).toBe(url);

      const responseTraceId = getTraceIdFromResponse(response);
      expect(responseTraceId?.hexString).toBe(fetchStartedLog.traceId);
    });
  });
});
