import path from "path";
import fs from "fs";
import { ReportFile } from "@/reportFile";
import {
  AggregatedResult,
  Config,
  Reporter,
  ReporterOnStartOptions,
} from "@jest/reporters";
import { Server } from "@/server";
import os from "os";
import { Test, TestCaseResult, TestContext } from "@jest/test-result";
import { Circus } from "@jest/types";
import { setTmpDirToEnv } from "@/env";
import { Logger } from "@/logger";
import { AnsiGreen, AnsiRed, AnsiReset } from "@/ansi";
import {
  PropagationTestConfig,
  PropagationTestConfigType,
} from "@/config/propagationTestConfig";
import { TestResult } from "@/testResult";
import { TobikuraConfig } from "@/config/tobikuraConfig";
import { FileSpace } from "@/fileSpace";
import { TestCaseStartInfo } from "@/jest/reporter/testCase";
import { omitDirPath } from "@/util/file";
import { hasValue } from "@/util/type";
import { TestCase } from "@/testCase";

const TOBIKURA_ROOT_DIR = path.resolve(__dirname, "../../");

export class JestReporter implements Reporter {
  private readonly jestRootDir: string;
  private readonly maxWorkers: number;
  private readonly output: string;
  private readonly fileSpace: FileSpace;
  private readonly serverPort: number;
  private readonly serverStopAfter: number;
  private readonly config: TobikuraConfig;

  private server?: Server;
  private lastError: Error | undefined;

  private currentTests: Map<string, TestCaseStartInfo> = new Map();
  private knownTestCount = 0;
  private collectedTestCaseElements: Map<string, TestCase[]> = new Map();

  constructor(
    globalConfig: Config.GlobalConfig,
    {
      output,
      serverPort = 3000,
      serverStopAfter = 20,
      debug = false,
      propagationTest,
    }: {
      output?: string;
      serverPort?: number;
      serverStopAfter?: number;
      debug?: boolean;
      propagationTest?: PropagationTestConfigType;
    },
  ) {
    if (!output) {
      throw new Error("Tobikura: invalid report option. `output` is required");
    }
    this.jestRootDir = globalConfig.rootDir;
    this.maxWorkers = globalConfig.maxWorkers;

    this.output = output;
    this.serverPort = serverPort;
    this.serverStopAfter = serverStopAfter;
    Logger.setShowDebug(debug);

    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "tobikura-"));
    setTmpDirToEnv(tmpdir);

    this.fileSpace = new FileSpace(tmpdir);
    this.fileSpace.ensureDirectoryExistence();

    this.config = new TobikuraConfig(
      new PropagationTestConfig(propagationTest),
    );
  }

  async onRunStart(results: AggregatedResult, options: ReporterOnStartOptions) {
    Logger.log("Starting server...");

    const busFiles: string[] = [];
    for (let i = 0; i < this.maxWorkers; i++) {
      busFiles.push(this.fileSpace.eventBusFilePath((i + 1).toString()));
    }

    this.server = await Server.start(this.serverPort, busFiles);
  }

  readonly getLastError = () => {
    return this.lastError;
  };

  async onRunComplete(_contexts: Set<TestContext>, _results: AggregatedResult) {
    if (!this.server) {
      throw new Error("Tobikura: server is not started");
    }

    const { capturedSpans, capturedLogs } = await this.server.stopAfter(
      this.serverStopAfter,
    );

    const testResult = await TestResult.collect(
      this.jestRootDir,
      this.fileSpace.testLogDir,
      capturedSpans,
      capturedLogs,
      this.config,
      this.collectedTestCaseElements,
    );
    const reportFile = new ReportFile(
      this.output,
      TOBIKURA_ROOT_DIR,
      this.config,
    );
    const outputPath = await reportFile.generate(testResult);

    Logger.log(
      `Report file is generated at ${AnsiGreen}${outputPath}${AnsiReset}`,
    );

    if (this.config.propagationTestConfig.enabled) {
      const passed = this.logPropagationTestResult(testResult);
      if (!passed) {
        this.lastError = new Error("Propagation leak found");
      }
    }
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
