import path from "path";
import fs from "fs";
import {
  AggregatedResult,
  Config,
  ReporterOnStartOptions,
} from "@jest/reporters";
import { Server } from "@/server";
import os from "os";
import { Test, TestCaseResult, TestContext } from "@jest/test-result";
import { Circus } from "@jest/types";
import { setTmpDirToEnv } from "@/env";
import { Logger } from "@/logger";
import { AnsiGreen, AnsiRed, AnsiReset } from "@/ansi";
import { TestResult } from "@/testResult";
import { TobikuraConfig } from "@/config/tobikuraConfig";
import { FileSpace } from "@/fileSpace";
import { TestCaseStartInfo } from "@/jest/reporter/testCase";
import { omitDirPath } from "@/util/file";
import { hasValue } from "@/util/type";
import { TestCase } from "@/testCase";
import { IReportFile } from "@/report/iReportFile";

export type PropagationTestConfig = {
  enabled?: boolean;
  ignore?: {
    attributes?: Record<string, string | boolean | number>;
    resource?: {
      attributes?: Record<string, string | boolean | number>;
    };
  };
};

export class Reporter {
  private readonly jestRootDir: string;
  private readonly maxWorkers: number;
  private readonly fileSpace: FileSpace;
  private readonly config: TobikuraConfig;

  private server?: Server;
  private lastError: Error | undefined;

  currentTests: Map<string, TestCaseStartInfo> = new Map();
  private knownTestCount = 0;
  collectedTestCaseElements: Map<string, TestCase[]> = new Map();

  constructor(globalConfig: Config.GlobalConfig, config: TobikuraConfig) {
    this.jestRootDir = globalConfig.rootDir;
    this.maxWorkers = globalConfig.maxWorkers;

    Logger.setShowDebug(config.debug);

    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "tobikura-"));
    setTmpDirToEnv(tmpdir);

    this.fileSpace = new FileSpace(tmpdir);
    this.fileSpace.ensureDirectoryExistence();

    this.config = config;
  }

  async onRunStart(results: AggregatedResult, options: ReporterOnStartOptions) {
    Logger.log("Starting server...");

    const busFiles: string[] = [];
    for (let i = 0; i < this.maxWorkers; i++) {
      busFiles.push(this.fileSpace.eventBusFilePath((i + 1).toString()));
    }

    this.server = await Server.start(this.config.serverPort, busFiles);
  }

  readonly getLastError = () => {
    return this.lastError;
  };

  async onRunComplete(
    _contexts: Set<TestContext>,
    _results: AggregatedResult,
    reportFile: IReportFile,
  ) {
    if (!this.server) {
      throw new Error("Tobikura: server is not started");
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
    const outputPath = await reportFile.generate(testResult);

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
    const failedSpanLength = Object.keys(propagationTestFailedSpans).length;
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
  ) {
    const startInfo = new TestCaseStartInfo(
      this.knownTestCount.toString(),
      omitDirPath(test.path, this.jestRootDir),
      testCaseStartInfo.fullName,
      testCaseStartInfo.startedAt ?? Date.now(),
    );
    this.knownTestCount++;
    this.currentTests.set(startInfo.file, startInfo);
  }

  async onTestCaseResult(test: Test, testCaseResult: TestCaseResult) {
    const testPath = omitDirPath(test.path, this.jestRootDir);
    const testCase = this.currentTests.get(testPath);
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
