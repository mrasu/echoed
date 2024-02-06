import { AnsiGreen, AnsiRed, AnsiReset } from "@/ansi";
import { Config, ServiceConfig } from "@/config/config";
import { CoverageCollector } from "@/coverage/coverageCollector";
import { OpenApiCoverageCollector } from "@/coverage/openApi/openApiCoverageCollector";
import { ProtoCoverageCollector } from "@/coverage/proto/protoCoverageCollector";
import { ServiceCoverageCollector } from "@/coverage/serviceCoverageCollector";
import { EchoedFatalError } from "@/echoedFatalError";
import { setTmpDirToEnv } from "@/env";
import { FileSpace } from "@/fileSpace";
import { TestCaseStartInfo } from "@/jest/reporter/testCase";
import { Logger } from "@/logger";
import { IReportFile } from "@/report/iReportFile";
import { Server } from "@/server";
import { TestCase } from "@/testCase";
import { TestResult } from "@/testResult";
import { omitDirPath } from "@/util/file";
import { hasValue } from "@/util/type";
import SwaggerParser from "@apidevtools/swagger-parser";
import {
  AggregatedResult,
  Config as JestReporterConfig,
  ReporterOnStartOptions,
} from "@jest/reporters";
import { Test, TestCaseResult, TestContext } from "@jest/test-result";
import { Circus } from "@jest/types";
import { Mutex } from "async-mutex";
import fs from "fs";
import os from "os";
import path from "path";
import protobuf from "protobufjs";

export class Reporter {
  private mutex = new Mutex();

  private readonly jestRootDir: string;
  private readonly maxWorkers: number;
  private readonly fileSpace: FileSpace;
  private readonly config: Config;
  private readonly coverageCollector: CoverageCollector;

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

  constructor(globalConfig: JestReporterConfig.GlobalConfig, config: Config) {
    this.jestRootDir = globalConfig.rootDir;
    this.maxWorkers = globalConfig.maxWorkers;

    Logger.setShowDebug(config.debug);

    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "echoed-"));
    setTmpDirToEnv(tmpdir);

    this.fileSpace = new FileSpace(tmpdir);
    this.fileSpace.ensureDirectoryExistence();

    this.config = config;
    this.coverageCollector = new CoverageCollector();
  }

  async onRunStart(
    _results: AggregatedResult,
    _options: ReporterOnStartOptions,
  ): Promise<void> {
    await this.prepareCoverageCollector();

    Logger.log("Starting server...");

    const busFiles: string[] = [];
    for (let i = 0; i < this.maxWorkers; i++) {
      busFiles.push(this.fileSpace.eventBusFilePath((i + 1).toString()));
    }

    this.server = await Server.start(this.config.serverPort, busFiles);
  }

  private async prepareCoverageCollector(): Promise<void> {
    for (const service of this.config.serviceConfigs) {
      const collector = await this.buildCoverageCollector(service);
      if (!collector) continue;

      this.coverageCollector.add(service.name, service.namespace, collector);
    }
  }

  private async buildCoverageCollector(
    service: ServiceConfig,
  ): Promise<ServiceCoverageCollector | undefined> {
    if (service.openapi) {
      const document = await SwaggerParser.parse(service.openapi.filePath);
      return OpenApiCoverageCollector.buildFromDocument(document);
    } else if (service.proto) {
      const root = await protobuf.load(service.proto.filePath);
      return ProtoCoverageCollector.buildFromRoot(
        root,
        service.proto.filePath,
        service.proto.services ? new Set(service.proto.services) : undefined,
      );
    } else {
      return undefined;
    }
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
    this.coverageCollector.markVisited([...capturedSpans.values()].flat());

    const testResult = await TestResult.collect(
      this.jestRootDir,
      this.fileSpace.testLogDir,
      capturedSpans,
      capturedLogs,
      this.config,
      this.collectedTestCaseElements,
    );
    const coverageResult = this.coverageCollector.getCoverage();

    const outputPath = await reportFile.generate(testResult, coverageResult);

    if (this.config.propagationTestConfig.enabled) {
      const passed = this.logPropagationTestResult(testResult);
      if (!passed) {
        this.lastError = new Error("Propagation leak found");
      }
    }

    Logger.log(
      `Report file is generated at ${AnsiGreen}${outputPath}${AnsiReset}`,
    );
  }

  private logPropagationTestResult(testResult: TestResult): boolean {
    const propagationTestFailedSpans = testResult.propagationFailedSpans;
    const failedSpanLength = propagationTestFailedSpans.size;
    const testName = "Propagation test";
    if (failedSpanLength === 0) {
      Logger.log(`${AnsiGreen}✓${AnsiReset} ${testName}`);
      return true;
    }

    Logger.log(`${AnsiRed}✕${AnsiReset} ${testName}`);
    Logger.logGrayComment(`${failedSpanLength} spans lack propagation`);

    testResult.propagationFailedRootSpans.forEach((span, index) => {
      Logger.logGrayComment(`${index + 1}: ${JSON.stringify(span)}`);
    });

    return false;
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

    const element = testCase.toTestCaseElement(
      testCaseResult.status,
      testCaseResult.duration ?? 0,
      testCaseResult.failureDetails.map((v) => JSON.stringify(v)),
      testCaseResult.failureMessages,
    );

    const collected = this.collectedTestCaseElements.get(element.file) || [];
    collected.push(element);
    this.collectedTestCaseElements.set(element.file, collected);
  }
}
