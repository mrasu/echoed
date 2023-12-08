import path from "path";
import fs from "fs";
import { ReportFile } from "./reportFile";
import {
  AggregatedResult,
  Config,
  Reporter,
  ReporterOnStartOptions,
} from "@jest/reporters";
import { Server } from "./server";
import os from "os";
import { Test, TestCaseResult, TestContext } from "@jest/test-result";
import { Circus } from "@jest/types";
import { setTmpDirToEnv } from "./env";
import { TestFinishedLog, TestStartedLog } from "./types";
import { Logger } from "./logger";
import { AnsiGreen, AnsiReset } from "./ansi";

export class JestReporter implements Reporter {
  private readonly jestRootDir: string;
  private readonly output: string;
  private readonly tmpdir: string;
  private readonly filename: string;
  private readonly serverPort: number;
  private readonly serverStopAfter: number;

  constructor(
    globalConfig: Config.GlobalConfig,
    {
      output,
      serverPort = 3000,
      serverStopAfter = 20,
      debug = false,
    }: {
      output?: string;
      serverPort?: number;
      serverStopAfter?: number;
      debug?: boolean;
    },
  ) {
    if (!output) {
      throw new Error("Tobikura: invalid report option. `output` is required");
    }
    this.jestRootDir = globalConfig.rootDir;

    this.output = output;
    this.serverPort = serverPort;
    this.serverStopAfter = serverStopAfter;
    Logger.setShowDebug(debug);

    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "tobikura-"));
    setTmpDirToEnv(tmpdir);

    this.tmpdir = tmpdir;
    this.filename = crypto.randomUUID() + ".json";
  }

  async onRunStart(results: AggregatedResult, options: ReporterOnStartOptions) {
    Logger.log("Starting server...");
    globalThis.__SERVER__ = await Server.start(this.serverPort);
  }

  async onRunComplete(_contexts: Set<TestContext>, _results: AggregatedResult) {
    const { capturedSpans, capturedLogs } =
      await globalThis.__SERVER__.stopAfter(this.serverStopAfter);

    const reportFile = new ReportFile(
      this.jestRootDir,
      this.output,
      this.tmpdir,
    );
    const outputPath = await reportFile.generate(capturedSpans, capturedLogs);

    Logger.log(
      `Report file is generated at ${AnsiGreen}${outputPath}${AnsiReset}`,
    );
  }

  async onTestCaseStart(
    test: Test,
    testCaseStartInfo: Circus.TestCaseStartInfo,
  ) {
    await this.logStarted({
      type: "testStarted",
      file: test.path,
      startTimeMillis: Date.now(),
      time: process.hrtime.bigint().toString(),
      testFullName: testCaseStartInfo.fullName,
    });
  }

  async onTestCaseResult(test: Test, testCaseResult: TestCaseResult) {
    await this.logFinished({
      type: "testFinished",
      file: test.path,
      time: process.hrtime.bigint().toString(),
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
    return path.join(this.tmpdir, this.filename);
  }
}
