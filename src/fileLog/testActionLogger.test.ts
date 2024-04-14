import { TestActionLogger } from "@/fileLog/testActionLogger";
import { MockFileLogger } from "@/testUtil/fileLog/mockFileLogger";
import { HexString } from "@/type/hexString";
import { FetchFailedLog, FetchFinishedLog, FetchStartedLog } from "@/types";

describe("TestActionLogger", () => {
  describe("logFetchStarted", () => {
    it("should log the fetch started event", async () => {
      const mockFileLogger = new MockFileLogger();
      const logger = new TestActionLogger(mockFileLogger);

      const startAt = new Date();
      await logger.logFetchStarted(
        "testId",
        new HexString("traceId"),
        "testPath",
        startAt,
      );

      expect(mockFileLogger.texts.length).toBe(1);

      const log = FetchStartedLog.parse(JSON.parse(mockFileLogger.texts[0]));
      expect(log).toEqual({
        type: "fetchStarted",
        testId: "testId",
        traceId: "traceId",
        testPath: "testPath",
        timeMillis: startAt.getTime(),
      });
    });
  });

  describe("logFetchFinished", () => {
    it("should log the fetch finished event", async () => {
      const mockFileLogger = new MockFileLogger();
      const logger = new TestActionLogger(mockFileLogger);

      await logger.logFetchFinished(
        new HexString("traceId"),
        {
          url: "https://localhost:3000/api/v1/cart",
          method: "GET",
          body: "body",
        },
        200,
        "responseBody",
      );

      expect(mockFileLogger.texts.length).toBe(1);

      const log = FetchFinishedLog.parse(JSON.parse(mockFileLogger.texts[0]));
      expect(log).toEqual({
        type: "fetchFinished",
        traceId: "traceId",
        request: {
          url: "https://localhost:3000/api/v1/cart",
          method: "GET",
          body: "body",
        },
        response: {
          status: 200,
          body: "responseBody",
        },
      });
    });
  });

  describe("logFetchFailed", () => {
    it("should log the fetch finished event", async () => {
      const mockFileLogger = new MockFileLogger();
      const logger = new TestActionLogger(mockFileLogger);

      await logger.logFetchFailed(
        new HexString("traceId"),
        {
          url: "https://localhost:3000/api/v1/cart",
          method: "GET",
          body: "body",
        },
        "reason",
      );

      expect(mockFileLogger.texts.length).toBe(1);

      const log = FetchFailedLog.parse(JSON.parse(mockFileLogger.texts[0]));
      expect(log).toEqual({
        type: "fetchFailed",
        traceId: "traceId",
        request: {
          url: "https://localhost:3000/api/v1/cart",
          method: "GET",
          body: "body",
        },
        reason: "reason",
      });
    });
  });
});
