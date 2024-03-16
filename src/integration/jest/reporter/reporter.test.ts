import { Config } from "@/config/config";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { Reporter } from "@/integration/jest/reporter/reporter";
import { TestCaseStartInfo } from "@/integration/jest/reporter/testCase";
import { Logger } from "@/logger";
import { TestCase } from "@/testCase";
import { MockFile } from "@/testUtil/fs/mockFile";
import { buildMockFsContainer } from "@/testUtil/fs/mockFsContainer";
import { buildAggregatedResult } from "@/testUtil/jest/aggregatedResult";
import { buildGlobalConfig } from "@/testUtil/jest/globalConfig";
import { buildReporterOnStartOptions } from "@/testUtil/jest/reporter";
import { buildTest, DEFAULT_TEST_PATH } from "@/testUtil/jest/test_";
import { buildTestCaseResult } from "@/testUtil/jest/testCaseResult";
import {
  buildTestCaseStartInfo,
  DEFAULT_TEST_FULL_NAME,
} from "@/testUtil/jest/testCaseStartInfo";
import { MockReportFile } from "@/testUtil/report/mockReportFile";

beforeEach(() => {
  Logger.setEnable(false);
});

afterEach(() => {
  Logger.setEnable(true);
});

describe("Reporter", () => {
  const defers: (() => Promise<void>)[] = [];
  afterEach(async () => {
    for (const defer of defers) {
      await defer();
    }
  });

  const buildReporter = (): Reporter => {
    const config = new Config(
      new MockFile(),
      13333,
      0,
      false,
      new PropagationTestConfig({
        enabled: true,
        ignore: {
          attributes: new Map(),
          resource: {
            attributes: new Map(),
          },
          conditions: [],
        },
      }),
      [],
      undefined,
    );
    const fsContainer = buildMockFsContainer();
    return new Reporter(fsContainer, buildGlobalConfig(), config);
  };

  const startReporter = async (): Promise<Reporter> => {
    const reporter = buildReporter();
    await reporter.onRunStart(
      buildAggregatedResult(),
      buildReporterOnStartOptions(),
    );

    return reporter;
  };

  const stopReporterDefer = (reporter: Reporter) => {
    return async (): Promise<void> => {
      const reportFile = new MockReportFile();
      await reporter.onRunComplete(
        new Set(),
        buildAggregatedResult(),
        reportFile,
      );
    };
  };

  describe("start and stop", () => {
    it("should call report", async () => {
      const reporter = await startReporter();
      defers.push(stopReporterDefer(reporter));

      const reportFile = new MockReportFile();
      await reporter.onRunComplete(
        new Set(),
        buildAggregatedResult(),
        reportFile,
      );

      expect(reportFile.testResult).toBeDefined();
    });

    describe("when tests run", () => {
      it("should call report", async () => {
        const reporter = await startReporter();
        defers.push(stopReporterDefer(reporter));

        const startedAt = new Date().getTime();

        await reporter.onTestCaseStart(
          buildTest(),
          buildTestCaseStartInfo({ startedAt }),
        );
        await reporter.onTestCaseResult(
          buildTest({ duration: 123 }),
          buildTestCaseResult({ duration: 123 }),
        );

        const reportFile = new MockReportFile();
        await reporter.onRunComplete(
          new Set(),
          buildAggregatedResult(),
          reportFile,
        );

        expect(reportFile.testResult?.testCaseResults.size).toBe(1);
        const tests =
          reportFile.testResult?.testCaseResults.get(DEFAULT_TEST_PATH);
        expect(tests).toBeDefined();
        expect(tests!.length).toBe(1);
        expect(tests![0]).toMatchObject({
          testId: "0",
          file: DEFAULT_TEST_PATH,
          name: DEFAULT_TEST_FULL_NAME,
          startTimeMillis: startedAt,
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

  describe("onTestCaseStart", () => {
    const buildTestStartInfoObject = (
      testId: string,
      file: string,
      startedAt: number,
    ): TestCaseStartInfo => {
      return new TestCaseStartInfo(
        testId,
        file,
        DEFAULT_TEST_FULL_NAME,
        startedAt,
      );
    };

    it("should hold current running test", async () => {
      const reporter = buildReporter();

      const startedAt = new Date().getTime();
      await reporter.onTestCaseStart(
        buildTest(),
        buildTestCaseStartInfo({ startedAt }),
      );

      expect(reporter.currentTestQueues.size).toBe(1);
      expect(reporter.currentTestQueues.get(DEFAULT_TEST_PATH)).toMatchObject([
        buildTestStartInfoObject("0", DEFAULT_TEST_PATH, startedAt),
      ]);
      expect(reporter.collectedTestCaseElements.size).toBe(0);
    });

    describe("when run multiple test parallely", () => {
      it("should hold multiple current running test", async () => {
        const reporter = buildReporter();

        const startedAt = new Date().getTime();
        await reporter.onTestCaseStart(
          buildTest({ path: "/path/to/dummy1.test.js" }),
          buildTestCaseStartInfo({ startedAt }),
        );

        await reporter.onTestCaseStart(
          buildTest({ path: "/path/to/dummy2.test.js" }),
          buildTestCaseStartInfo({ startedAt }),
        );

        expect(reporter.currentTestQueues.size).toBe(2);
        expect(
          reporter.currentTestQueues.get("/path/to/dummy1.test.js"),
        ).toMatchObject([
          buildTestStartInfoObject("0", "/path/to/dummy1.test.js", startedAt),
        ]);

        expect(
          reporter.currentTestQueues.get("/path/to/dummy2.test.js"),
        ).toMatchObject([
          buildTestStartInfoObject("1", "/path/to/dummy2.test.js", startedAt),
        ]);
      });
    });

    describe("when test started multiple times", () => {
      it("should hold multiple test", async () => {
        const reporter = buildReporter();

        const startedAt = new Date().getTime();
        await reporter.onTestCaseStart(
          buildTest(),
          buildTestCaseStartInfo({ startedAt }),
        );

        await reporter.onTestCaseStart(
          buildTest(),
          buildTestCaseStartInfo({ startedAt: startedAt + 222 }),
        );

        expect(reporter.currentTestQueues.size).toBe(1);
        expect(reporter.currentTestQueues.get(DEFAULT_TEST_PATH)).toMatchObject(
          [
            buildTestStartInfoObject("0", DEFAULT_TEST_PATH, startedAt),
            buildTestStartInfoObject("1", DEFAULT_TEST_PATH, startedAt + 222),
          ],
        );
      });
    });
  });

  const buildTestCaseObject = (
    testId: string,
    file: string,
    startedAt: number,
  ): TestCase => {
    return new TestCase(
      testId,
      file,
      DEFAULT_TEST_FULL_NAME,
      startedAt,
      "passed",
      123,
      [],
      [],
    );
  };
  describe("onTestCaseResult", () => {
    it("should record the result of test", async () => {
      const reporter = buildReporter();

      const startedAt = new Date().getTime();
      await reporter.onTestCaseStart(
        buildTest(),
        buildTestCaseStartInfo({ startedAt }),
      );
      await reporter.onTestCaseResult(buildTest(), buildTestCaseResult());

      expect(reporter.collectedTestCaseElements.size).toBe(1);
      expect(
        reporter.collectedTestCaseElements.get(DEFAULT_TEST_PATH),
      ).toMatchObject([buildTestCaseObject("0", DEFAULT_TEST_PATH, startedAt)]);
    });

    describe("when running multiple tests", () => {
      it("should record the multiple result of tests", async () => {
        const reporter = buildReporter();

        const startedAt = new Date().getTime();
        await reporter.onTestCaseStart(
          buildTest(),
          buildTestCaseStartInfo({ startedAt }),
        );
        await reporter.onTestCaseResult(buildTest(), buildTestCaseResult());
        await reporter.onTestCaseStart(
          buildTest(),
          buildTestCaseStartInfo({ startedAt: startedAt + 222 }),
        );
        await reporter.onTestCaseResult(buildTest(), buildTestCaseResult());

        expect(reporter.collectedTestCaseElements.size).toBe(1);
        expect(
          reporter.collectedTestCaseElements.get(DEFAULT_TEST_PATH),
        ).toMatchObject([
          buildTestCaseObject("0", DEFAULT_TEST_PATH, startedAt),
          buildTestCaseObject("1", DEFAULT_TEST_PATH, startedAt + 222),
        ]);
      });
    });
  });

  describe("onTestCaseStart and onTestCaseResult", () => {
    describe("when running tests parallel", () => {
      it("should record all result of tests", async () => {
        const reporter = buildReporter();

        const startedAt = new Date().getTime();
        await reporter.onTestCaseStart(
          buildTest({ path: "/path/to/dummy1.test.js" }),
          buildTestCaseStartInfo({ startedAt }),
        );
        await reporter.onTestCaseStart(
          buildTest({ path: "/path/to/dummy2.test.js" }),
          buildTestCaseStartInfo({ startedAt }),
        );
        await reporter.onTestCaseResult(
          buildTest({ path: "/path/to/dummy1.test.js" }),
          buildTestCaseResult(),
        );
        await reporter.onTestCaseStart(
          buildTest({ path: "/path/to/dummy1.test.js" }),
          buildTestCaseStartInfo({ startedAt: startedAt + 222 }),
        );
        await reporter.onTestCaseResult(
          buildTest({ path: "/path/to/dummy1.test.js" }),
          buildTestCaseResult(),
        );
        await reporter.onTestCaseResult(
          buildTest({ path: "/path/to/dummy2.test.js" }),
          buildTestCaseResult(),
        );

        expect(reporter.collectedTestCaseElements.size).toBe(2);
        expect(
          reporter.collectedTestCaseElements.get("/path/to/dummy1.test.js"),
        ).toMatchObject([
          buildTestCaseObject("0", "/path/to/dummy1.test.js", startedAt),
          buildTestCaseObject("2", "/path/to/dummy1.test.js", startedAt + 222),
        ]);
        expect(
          reporter.collectedTestCaseElements.get("/path/to/dummy2.test.js"),
        ).toMatchObject([
          buildTestCaseObject("1", "/path/to/dummy2.test.js", startedAt),
        ]);
      });
    });

    describe("when calling start before calling result", () => {
      it("should record all result correctly", async () => {
        const reporter = buildReporter();

        const startedAt = new Date().getTime();
        await reporter.onTestCaseStart(
          buildTest(),
          buildTestCaseStartInfo({ startedAt }),
        );
        await reporter.onTestCaseStart(
          buildTest(),
          buildTestCaseStartInfo({ startedAt: startedAt + 222 }),
        );
        await reporter.onTestCaseResult(buildTest(), buildTestCaseResult());
        await reporter.onTestCaseResult(buildTest(), buildTestCaseResult());

        expect(reporter.collectedTestCaseElements.size).toBe(1);
        expect(
          reporter.collectedTestCaseElements.get(DEFAULT_TEST_PATH),
        ).toMatchObject([
          buildTestCaseObject("0", DEFAULT_TEST_PATH, startedAt),
          buildTestCaseObject("1", DEFAULT_TEST_PATH, startedAt + 222),
        ]);
      });
    });
  });
});
