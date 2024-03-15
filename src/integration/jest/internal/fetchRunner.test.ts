import { TestActionLogger } from "@/fileLog/testActionLogger";
import { FetchRunner } from "@/integration/jest/internal/fetchRunner";
import { MockFileLogger } from "@/testUtil/fileLog/mockFileLogger";

describe("FetchRunner", () => {
  describe("run", () => {
    it("should log fetch started and finished", async () => {
      const mockFetch = jest.fn().mockReturnValue(new Response());
      const mockFileLogger = new MockFileLogger();
      const testActionLogger = new TestActionLogger(mockFileLogger);

      const fetchRunner = new FetchRunner(
        testActionLogger,
        mockFetch,
        "testPath",
      );
      await fetchRunner.run("https://example.com/a/b", undefined);

      expect(mockFileLogger.texts.length).toBe(2);
      expect(JSON.parse(mockFileLogger.texts[0])).toEqual({
        type: "fetchStarted",
        testId: undefined,
        traceId: expect.any(String) as string,
        testPath: "testPath",
        timeMillis: expect.any(Number) as number,
      });
      expect(JSON.parse(mockFileLogger.texts[1])).toEqual({
        type: "fetchFinished",
        traceId: expect.any(String) as string,
        request: {
          url: "https://example.com/a/b",
          method: "GET",
        },
        response: {
          status: 200,
          body: expect.stringContaining(
            "Not displayable. content-type",
          ) as string,
        },
      });
    });
  });
});
