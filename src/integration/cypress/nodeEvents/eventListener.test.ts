import { FileSpace } from "@/fileSpace/fileSpace";
import { EventListener } from "@/integration/cypress/nodeEvents/eventListener";
import { Logger } from "@/logger";
import { TestFailedError } from "@/report/testFailedError";
import { IServer } from "@/server/iServer";
import { TestCase } from "@/testCase";
import { buildConfig } from "@/testUtil/config/config";
import { buildMockFsContainer } from "@/testUtil/fs/mockFsContainer";
import { buildHttpOtelSpan } from "@/testUtil/otel/otelSpan";
import { MockReportFile } from "@/testUtil/report/mockReportFile";
import { buildTestCase } from "@/testUtil/report/testCase";
import { DummyServer } from "@/testUtil/server/server";
import { OtelSpan } from "@/type/otelSpan";
import { buildRandomHexUUID } from "@/util/random";

describe("EventListener", () => {
  const setup = (
    serverPort: number,
  ): {
    eventListener: EventListener;
    fn: jest.Mock<Promise<IServer>, [number]>;
  } => {
    const config = buildConfig({ serverPort: serverPort });
    const fn = jest.fn<Promise<IServer>, [number]>();
    const eventListener = new EventListener("cwd", config, fn);
    return { eventListener, fn };
  };

  describe("onBeforeRun", () => {
    it("should start server", async () => {
      const { eventListener, fn } = setup(1234);

      const dir = buildMockFsContainer().newDirectory("foo");
      await eventListener.onBeforeRun(dir);
      expect(fn).toHaveBeenCalledWith(1234);
    });
  });

  describe("onBeforeBrowserLaunch", () => {
    describe("when onBeforeRun is called", () => {
      it("should start server", async () => {
        const { eventListener, fn } = setup(1234);

        const dir = buildMockFsContainer().newDirectory("foo");
        await eventListener.onBeforeRun(dir);
        expect(fn).toHaveBeenCalledTimes(1);

        await eventListener.onBeforeBrowserLaunch(dir);
        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    describe("when onBeforeRun is not called", () => {
      it("should start server", async () => {
        const { eventListener, fn } = setup(1234);

        const dir = buildMockFsContainer().newDirectory("foo");
        await eventListener.onBeforeBrowserLaunch(dir);
        expect(fn).toHaveBeenCalledWith(1234);
        expect(fn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("onAfterRun", () => {
    beforeEach(() => {
      Logger.setEnable(false);
    });

    afterEach(() => {
      Logger.setEnable(true);
    });

    const createEventListener = (v: {
      capturedTestCases?: Map<string, TestCase[]>;
      capturedSpans?: Map<string, OtelSpan[]>;
    }): EventListener => {
      const config = buildConfig();
      const server = new DummyServer(v);
      const eventListener = new EventListener("cwd", config, async () =>
        Promise.resolve(server),
      );
      eventListener.server = server;
      const dir = buildMockFsContainer().newDirectory("foo");
      eventListener.fileSpace = new FileSpace(dir);

      return eventListener;
    };

    it("should generate report", async () => {
      const testCase = buildTestCase();
      const eventListener = createEventListener({
        capturedTestCases: new Map([[testCase.file, [testCase]]]),
      });
      const reportFile = new MockReportFile();

      await eventListener.onAfterRun(reportFile);

      expect(
        reportFile.testResult?.testCaseResults.get(testCase.file)?.length,
      ).toEqual(1);
    });

    describe("when propagation is leaked", () => {
      it("should throw TestFailedError", async () => {
        const eventListener = createEventListener({
          capturedSpans: new Map([
            [buildRandomHexUUID(), [buildHttpOtelSpan()]],
          ]),
        });
        const reportFile = new MockReportFile();

        await expect(eventListener.onAfterRun(reportFile)).rejects.toThrow(
          TestFailedError,
        );
      });
    });
  });
});
