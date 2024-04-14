import { TestActionLogger } from "@/fileLog/testActionLogger";
import { ApiRequestProxyFetchRunner } from "@/integration/playwright/internal/hook/apiRequestProxyFetchRunner";
import { getTraceIdFromAPIResponse } from "@/integration/playwright/internal/util/apiResponse";
import { MockFileLogger } from "@/testUtil/fileLog/mockFileLogger";
import { buildPlaywrightTestInfo } from "@/testUtil/playwright/testInfo";
import { FetchFinishedLog, FetchStartedLog } from "@/types";
import { APIRequestContext } from "@playwright/test";

describe("ApiRequestProxyFetchRunner", () => {
  describe("run", () => {
    describe("when using url", () => {
      const url = "https://example.com/dummy";
      const buildFetcher = (url: string): APIRequestContext => {
        return {
          fetch: jest.fn().mockReturnValueOnce({
            url: () => url,
            status: () => 200,
            headers: () => ({}),
          }),
        } as unknown as APIRequestContext;
      };

      describe("when using no options", () => {
        it("should log fetch started and finished", async () => {
          const mockFileLogger = new MockFileLogger();
          const logger = new TestActionLogger(mockFileLogger);
          const runner = new ApiRequestProxyFetchRunner(logger);
          const fetcher = buildFetcher(url);
          const testInfo = buildPlaywrightTestInfo({
            testId: "testId",
          });
          const response = await runner.run(
            fetcher,
            fetcher,
            testInfo,
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

          const responseTraceId = getTraceIdFromAPIResponse(response);
          expect(responseTraceId?.hexString).toBe(fetchStartedLog.traceId);
        });
      });

      describe("when POST", () => {
        it("should log method and body", async () => {
          const mockFileLogger = new MockFileLogger();
          const logger = new TestActionLogger(mockFileLogger);
          const runner = new ApiRequestProxyFetchRunner(logger);
          const fetcher = buildFetcher(url);
          const testInfo = buildPlaywrightTestInfo({
            testId: "testId",
          });

          await runner.run(fetcher, fetcher, testInfo, url, {
            method: "POST",
            data: "dummy data",
          });

          const fetchFinishedLog = FetchFinishedLog.parse(
            JSON.parse(mockFileLogger.texts[1]),
          );
          expect(fetchFinishedLog.request.method).toBe("POST");
          expect(fetchFinishedLog.request.body).toBe("dummy data");
        });
      });

      describe("when body is buffer", () => {
        it("should log body", async () => {
          const mockFileLogger = new MockFileLogger();
          const logger = new TestActionLogger(mockFileLogger);
          const runner = new ApiRequestProxyFetchRunner(logger);
          const fetcher = buildFetcher(url);
          const testInfo = buildPlaywrightTestInfo({
            testId: "testId",
          });

          await runner.run(fetcher, fetcher, testInfo, url, {
            data: Buffer.from("dummy data"),
          });

          const fetchFinishedLog = FetchFinishedLog.parse(
            JSON.parse(mockFileLogger.texts[1]),
          );
          expect(fetchFinishedLog.request.body).toBe("dummy data");
        });
      });

      describe("when body is object", () => {
        it("should log body", async () => {
          const mockFileLogger = new MockFileLogger();
          const logger = new TestActionLogger(mockFileLogger);
          const runner = new ApiRequestProxyFetchRunner(logger);
          const fetcher = buildFetcher(url);
          const testInfo = buildPlaywrightTestInfo({
            testId: "testId",
          });

          await runner.run(fetcher, fetcher, testInfo, url, {
            data: { hello: "world" },
          });

          const fetchFinishedLog = FetchFinishedLog.parse(
            JSON.parse(mockFileLogger.texts[1]),
          );
          expect(fetchFinishedLog.request.body).toBe('{"hello":"world"}');
        });
      });

      describe("when body is form", () => {
        it("should log body", async () => {
          const mockFileLogger = new MockFileLogger();
          const logger = new TestActionLogger(mockFileLogger);
          const runner = new ApiRequestProxyFetchRunner(logger);
          const fetcher = buildFetcher(url);
          const testInfo = buildPlaywrightTestInfo({
            testId: "testId",
          });

          await runner.run(fetcher, fetcher, testInfo, url, {
            form: { hello: "world" },
          });

          const fetchFinishedLog = FetchFinishedLog.parse(
            JSON.parse(mockFileLogger.texts[1]),
          );
          expect(fetchFinishedLog.request.body).toBe('{"hello":"world"}');
        });
      });

      describe("when body is multipart", () => {
        it("should log body", async () => {
          const mockFileLogger = new MockFileLogger();
          const logger = new TestActionLogger(mockFileLogger);
          const runner = new ApiRequestProxyFetchRunner(logger);
          const fetcher = buildFetcher(url);
          const testInfo = buildPlaywrightTestInfo({
            testId: "testId",
          });

          await runner.run(fetcher, fetcher, testInfo, url, {
            multipart: {
              hello: "world",
              myFile: {
                name: "fileName",
                mimeType: "text/plain",
                buffer: Buffer.from("dummy data"),
              },
            },
          });

          const fetchFinishedLog = FetchFinishedLog.parse(
            JSON.parse(mockFileLogger.texts[1]),
          );
          expect(JSON.parse(fetchFinishedLog.request.body ?? "")).toEqual({
            hello: "world",
            myFile: "[Not displayable]",
          });
        });
      });
    });
  });
});
