import { Config } from "@/config/config";
import { EchoedFatalError } from "@/echoedFatalError";
import { setServerPortToEnv, setTmpDirToEnv } from "@/env";
import { FileSpace } from "@/fileSpace/fileSpace";
import { FsContainer } from "@/fs/fsContainer";
import {
  analyzeCoverage,
  logFileCreated,
  logPropagationTestResult,
} from "@/integration/common/util/reporter";
import { TestCaseStartInfo } from "@/integration/jest/reporter/testCase";
import { Logger } from "@/logger";
import { IReportFile } from "@/report/iReportFile";
import { TestFailedError } from "@/report/testFailedError";
import { Server } from "@/server/server";
import { TestCase } from "@/testCase";
import { TestResult } from "@/testResult";
import { omitDirPath } from "@/util/file";
import { hasValue } from "@/util/type";
import {
  AggregatedResult,
  Config as JestReporterConfig,
  ReporterOnStartOptions,
} from "@jest/reporters";
import { Test, TestCaseResult, TestContext } from "@jest/test-result";
import { Circus } from "@jest/types";
import { Mutex } from "async-mutex";
import os from "os";
import path from "path";

export class Reporter {
  private mutex = new Mutex();

  private readonly jestRootDir: string;
  private readonly maxWorkers: number;
  private readonly fileSpace: FileSpace;
  private readonly config: Config;

  private server?: Server;
  private lastError: Error | undefined;

  // currentTestQueue is a queue of started test.
  //
  // Because Jest (jest-circus) doesn't wait for "finish" event processing,
  //   it's possible that "start" event for the next test is dispatched before the "finish" event of previous test is dispatched.
  // So we cannot guarantee that the last started test is the test that finished in onTestCaseResult.
  // However, because Jest waits for "start" event processing, we can guarantee that the order of "start" events is correct.
  // And because it waits for "start", we can guarantee that the order of "finish" events is correct too.
  // So by using queue, we can know the finished test in onTestCaseResult.
  //
  // If we represent it graphically, the order of events can be the following patterns:
  // * start(test1) -> finish(test1) -> start(test2) -> finish(test2)
  // * start(test1) -> start(test2) -> finish(test1) -> finish(test2)
  // Note: start(test1) and start(test2) won't be queued in the opposite order as Jest waits for "start".
  currentTestQueues: Map<string, TestCaseStartInfo[]> = new Map();

  private knownTestCount = 0;
  collectedTestCaseElements: Map<string, TestCase[]> = new Map();

  constructor(
    fsContainer: FsContainer,
    globalConfig: JestReporterConfig.GlobalConfig,
    config: Config,
  ) {
    this.jestRootDir = globalConfig.rootDir;
    this.maxWorkers = globalConfig.maxWorkers;

    Logger.setShowDebug(config.debug);

    const tmpdir = fsContainer.mkdtempSync(path.join(os.tmpdir(), "echoed-"));
    setTmpDirToEnv(tmpdir.path);
    setServerPortToEnv(config.serverPort);

    this.fileSpace = new FileSpace(tmpdir);
    this.fileSpace.ensureDirectoryExistence();

    this.config = config;
  }

  async onRunStart(
    _results: AggregatedResult,
    _options: ReporterOnStartOptions,
  ): Promise<void> {
    Logger.log("Starting server...");

    this.server = await Server.start(this.config.serverPort);
  }

  readonly getLastError = (): Error | undefined => {
    return this.lastError;
  };

  async onRunComplete(
    _contexts: Set<TestContext>,
    _results: AggregatedResult,
    reportFile: IReportFile,
  ): Promise<void> {
    if (!this.server) {
      throw new EchoedFatalError("Server is not started");
    }

    const { capturedSpans, capturedLogs } = await this.server.stopAfter(
      this.config.serverStopAfter,
    );

    const testResult = await TestResult.collect(
      this.jestRootDir,
      this.fileSpace.testLogDir,
      capturedSpans,
      capturedLogs,
      this.config,
      this.collectedTestCaseElements,
    );
    const coverageResult = await analyzeCoverage(this.config, capturedSpans);

    const outFile = await reportFile.generate(testResult, coverageResult);

    if (this.config.propagationTestConfig.enabled) {
      const passed = logPropagationTestResult(testResult);
      if (!passed) {
        this.lastError = new TestFailedError("Propagation leak found");
      }
    }

    logFileCreated(outFile);
  }

  async onTestCaseStart(
    test: Test,
    testCaseStartInfo: Circus.TestCaseStartInfo,
  ): Promise<void> {
    const startInfo = new TestCaseStartInfo(
      this.knownTestCount.toString(),
      omitDirPath(test.path, this.jestRootDir),
      testCaseStartInfo.fullName,
      testCaseStartInfo.startedAt ?? Date.now(),
    );
    this.knownTestCount++;

    await this.mutex.runExclusive(() => {
      const startInfos = this.currentTestQueues.get(startInfo.file) ?? [];
      startInfos.push(startInfo);
      this.currentTestQueues.set(startInfo.file, startInfos);
    });
  }

  async onTestCaseResult(
    test: Test,
    testCaseResult: TestCaseResult,
  ): Promise<void> {
    const testCase = await this.mutex.runExclusive(
      (): TestCaseStartInfo | undefined => {
        const testPath = omitDirPath(test.path, this.jestRootDir);
        const testCases = this.currentTestQueues.get(testPath);
        if (!testCases) return;
        const testCase = testCases.shift();
        if (!testCase) return;
        this.currentTestQueues.set(testPath, testCases);
        return testCase;
      },
    );
    if (!testCase) return;

    if (!hasValue(testCaseResult)) {
      Logger.warn(
        "Unexpected situation. Traces may not appear correctly. no testCaseResult.duration",
      );
    }

    const duration = testCaseResult.duration ?? 0;
    const element = testCase.toTestCaseElement(
      testCaseResult.status,
      duration,
      // Because Jest starts the next test without waiting for `onTestCaseResult`, we cannot find exact test finished time. Instead, use `startTimeMillis + duration` as finished time.
      testCase.startTimeMillis + duration,
      testCaseResult.failureDetails.map((v) => JSON.stringify(v)),
      testCaseResult.failureMessages,
    );

    const collected = this.collectedTestCaseElements.get(element.file) || [];
    collected.push(element);
    this.collectedTestCaseElements.set(element.file, collected);
  }
}
