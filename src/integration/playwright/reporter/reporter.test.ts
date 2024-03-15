import { FileSpace } from "@/fileSpace/fileSpace";
import { Reporter } from "@/integration/playwright/reporter/reporter";
import { Logger } from "@/logger";
import { TestCase } from "@/testCase";
import { buildConfig } from "@/testUtil/config/config";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";
import {
  buildPlaywrightTestCase,
  DEFAULT_TEST_PATH,
} from "@/testUtil/playwright/testCase";
import {
  buildPlaywrightTestResult,
  makeTestResultFailed,
} from "@/testUtil/playwright/testResult";
import { MockReportFile } from "@/testUtil/report/mockReportFile";
import type { FullResult } from "@playwright/test/reporter";

beforeEach(() => {
  Logger.setEnable(false);
});

afterEach(() => {
  Logger.setEnable(true);
});

describe("Reporter", () => {
  describe("onBegin", () => {
    it("should set fileSpaceInitializedBeforeStart false", () => {
      const reporter = new Reporter(buildConfig());
      reporter.onBegin("rootDir");

      expect(reporter.isFileSpaceInitializedBeforeStart).toBe(false);
    });
  });

  describe("markFileSpaceInitializedBeforeStart", () => {
    it("should set fileSpaceInitializedBeforeStart true", () => {
      const reporter = new Reporter(buildConfig());
      reporter.markFileSpaceInitializedBeforeStart();

      expect(reporter.isFileSpaceInitializedBeforeStart).toBe(true);
    });
  });

  describe("onTestBegin and onTestEnd", () => {
    it("should set collectedTestCaseElements", () => {
      const reporter = new Reporter(buildConfig());

      const test = buildPlaywrightTestCase({
        id: "123-456",
        location: {
          file: "dummyFile",
          line: 1,
          column: 1,
        },
      });
      const result = buildPlaywrightTestResult();

      reporter.onTestBegin(test, result);
      reporter.onTestEnd(test, result);

      expect(reporter.collectedTestCaseElements.get("dummyFile")).toEqual([
        new TestCase(
          "123-456",
          "dummyFile",
          "testUtil > myTestCase",
          result.startTime.getTime(),
          "passed",
          123,
          [],
          [],
        ),
      ]);
    });

    describe("when test failed", () => {
      it("should record failure details", () => {
        const reporter = new Reporter(buildConfig());

        const test = buildPlaywrightTestCase();
        const result = buildPlaywrightTestResult();

        reporter.onTestBegin(test, result);

        const failedResult = makeTestResultFailed(result);
        reporter.onTestEnd(test, failedResult);

        expect(
          reporter.collectedTestCaseElements.get(DEFAULT_TEST_PATH),
        ).toEqual([
          new TestCase(
            "1-1",
            DEFAULT_TEST_PATH,
            "testUtil > myTestCase",
            result.startTime.getTime(),
            "failed",
            123,
            [
              JSON.stringify({
                message: "test failed",
                value: "value",
                snippet: "snippet",
                stack: "stack",
                location: "dummyFile:1:1",
              }),
            ],
            ["test failed"],
          ),
        ]);
      });
    });
  });

  describe("onEnd", () => {
    const createFileSpace = async (): Promise<FileSpace> => {
      const fileContents = new MockFileContents();
      const fileSpace = new FileSpace(
        new MockDirectory("mockDir", fileContents),
      );

      await fileSpace.otelDir.spanFile.write("{}");
      await fileSpace.otelDir.logFile.write("{}");

      return fileSpace;
    };

    it("should create report", async () => {
      const test = buildPlaywrightTestCase();
      const result = buildPlaywrightTestResult();

      const reporter = new Reporter(buildConfig());
      reporter.onTestBegin(test, result);
      reporter.onTestEnd(test, result);

      const fullResult: FullResult = {
        status: "passed",
        startTime: new Date(),
        duration: 1234,
      };

      const fileSpace = await createFileSpace();
      const reportFile = new MockReportFile();
      await reporter.onEnd(fullResult, fileSpace, reportFile);

      expect(reportFile.testResult?.testCaseResults.size).toBe(1);
      const tests =
        reportFile.testResult?.testCaseResults.get(DEFAULT_TEST_PATH);
      expect(tests).toBeDefined();
      expect(tests!.length).toBe(1);
      expect(tests![0]).toMatchObject({
        testId: "1-1",
        file: DEFAULT_TEST_PATH,
        name: "testUtil > myTestCase",
        startTimeMillis: result.startTime.getTime(),
        status: "passed",
        orderedTraceIds: [],
        fetches: [],
        duration: 123,
        failureDetails: [],
        failureMessages: [],
      });
    });
  });
});
