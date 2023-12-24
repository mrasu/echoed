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
import { TestFinishedLog, TestStartedLog } from "@/types";
import { Logger } from "@/logger";
import { AnsiGreen, AnsiRed, AnsiReset } from "@/ansi";
import {
  PropagationTestConfig,
  PropagationTestConfigType,
} from "@/config/propagationTestConfig";
import { TestResult } from "@/testResult";
import { TobikuraConfig } from "@/config/tobikuraConfig";
import { FileSpace } from "@/fileSpace";

const TOBIKURA_ROOT_DIR = path.resolve(__dirname, "../../");

export class JestReporter implements Reporter {
  private readonly jestRootDir: string;
  private readonly maxWorkers: number;
  private readonly output: string;
  private readonly fileSpace: FileSpace;
  private readonly filename: string;
  private readonly serverPort: number;
  private readonly serverStopAfter: number;
  private readonly config: TobikuraConfig;

  private lastError: Error | undefined;

  private currentTests: Map<string, Circus.TestCaseStartInfo> = new Map();

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

    this.filename = crypto.randomUUID() + ".json";

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

    globalThis.__SERVER__ = await Server.start(this.serverPort, busFiles);
  }

  readonly getLastError = () => {
    return this.lastError;
  };

  async onRunComplete(_contexts: Set<TestContext>, _results: AggregatedResult) {
    const { capturedSpans, capturedLogs } =
      await globalThis.__SERVER__.stopAfter(this.serverStopAfter);

    const testResult = await TestResult.collect(
      this.jestRootDir,
      this.fileSpace.testLogDir,
      capturedSpans,
      capturedLogs,
      this.config,
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
    // TODO: no need to log? isn't memory enough?
    await this.logStarted({
      type: "testStarted",
      file: test.path,
      timeMillis: testCaseStartInfo.startedAt || Date.now(),
      testFullName: testCaseStartInfo.fullName,
    });
    this.currentTests.set(test.path, testCaseStartInfo);
  }

  async onTestCaseResult(test: Test, testCaseResult: TestCaseResult) {
    const startInfo = this.currentTests.get(test.path);

    let finishedAt: number;
    if (startInfo?.startedAt && testCaseResult.duration) {
      finishedAt = startInfo.startedAt + testCaseResult.duration;
    } else {
      Logger.warn(
        "Unexpected situation. Traces may not appear correctly. no startInfo?.startedAt or testCaseResult.duration",
      );
      finishedAt = Date.now();
    }

    // TODO: no need to log? isn't memory enough?
    await this.logFinished({
      type: "testFinished",
      file: test.path,
      timeMillis: finishedAt,
      status: testCaseResult.status,
      failureDetails: testCaseResult.failureDetails.map((v) =>
        JSON.stringify(v),
      ),
      failureMessages: testCaseResult.failureMessages,
      duration: testCaseResult.duration || undefined,
    });
  }

  private async logStarted(value: TestStartedLog) {
    await this.logText(JSON.stringify(value));
  }

  private async logFinished(value: TestFinishedLog) {
    await this.logText(JSON.stringify(value));
  }

  private async logText(text: string) {
    await new Promise((resolve, reject) => {
      fs.appendFile(this.logFilePath, text + "\n", (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(undefined);
      });
    });
  }

  private get logFilePath() {
    return path.join(this.fileSpace.testLogDir, this.filename);
  }
}
