import path from "path";
import fs from "fs";
import { ReportConfig, ReportFile } from "@/reportFile";
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
import { TobikuraSpan } from "@/type/tobikuraSpan";
import {
  PropagationTestConfig,
  PropagationTestConfigType,
} from "@/config/propagationTestConfig";

const TOBIKURA_ROOT_DIR = path.resolve(__dirname, "../../");

export class JestReporter implements Reporter {
  private readonly jestRootDir: string;
  private readonly output: string;
  private readonly tmpdir: string;
  private readonly filename: string;
  private readonly serverPort: number;
  private readonly serverStopAfter: number;
  private readonly propagationTestConfig: PropagationTestConfig;

  private lastError: Error | undefined;

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

    this.output = output;
    this.serverPort = serverPort;
    this.serverStopAfter = serverStopAfter;
    Logger.setShowDebug(debug);

    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "tobikura-"));
    setTmpDirToEnv(tmpdir);

    this.tmpdir = tmpdir;
    this.filename = crypto.randomUUID() + ".json";

    this.propagationTestConfig = new PropagationTestConfig(propagationTest);
  }

  async onRunStart(results: AggregatedResult, options: ReporterOnStartOptions) {
    Logger.log("Starting server...");
    globalThis.__SERVER__ = await Server.start(this.serverPort);
  }

  readonly getLastError = () => {
    return this.lastError;
  };

  async onRunComplete(_contexts: Set<TestContext>, _results: AggregatedResult) {
    const { capturedSpans, capturedLogs } =
      await globalThis.__SERVER__.stopAfter(this.serverStopAfter);

    const { spans, orphanSpans } = this.splitByOrphanOrNot(capturedSpans);

    const reportFile = new ReportFile(
      this.jestRootDir,
      this.output,
      this.tmpdir,
      TOBIKURA_ROOT_DIR,
      this.buildReportConfig(),
    );

    const outputPath = await reportFile.generate(
      spans,
      orphanSpans,
      capturedLogs,
    );

    Logger.log(
      `Report file is generated at ${AnsiGreen}${outputPath}${AnsiReset}`,
    );

    if (this.propagationTestConfig.enabled) {
      const passed = this.logPropagationTestResult(orphanSpans);
      if (!passed) {
        this.lastError = new Error("Propagation leak found");
      }
    }
  }

  private splitByOrphanOrNot(allSpans: Record<string, TobikuraSpan[]>): {
    spans: Record<string, TobikuraSpan[]>;
    orphanSpans: Record<string, TobikuraSpan[]>;
  } {
    const orphanTraceIds: Set<string> = new Set();

    for (const [traceId, spanList] of Object.entries(allSpans)) {
      for (const span of spanList) {
        if (!span.isRoot) continue;
        if (span.shouldIgnoreFromPropagationTest(this.propagationTestConfig)) {
          continue;
        }

        orphanTraceIds.add(traceId);
        break;
      }
    }

    const spans: Record<string, TobikuraSpan[]> = {};
    const orphanSpans: Record<string, TobikuraSpan[]> = {};

    for (const [traceId, spanList] of Object.entries(allSpans)) {
      if (orphanTraceIds.has(traceId)) {
        orphanSpans[traceId] = spanList;
      } else {
        spans[traceId] = spanList;
      }
    }

    return { spans, orphanSpans };
  }

  private buildReportConfig(): ReportConfig {
    return {
      propagationTestEnabled: this.propagationTestConfig.enabled,
    };
  }

  private logPropagationTestResult(
    orphanSpans: Record<string, TobikuraSpan[]>,
  ): boolean {
    const orphanSpanLength = Object.keys(orphanSpans).length;
    const testName = "Propagation test";
    if (orphanSpanLength === 0) {
      Logger.log(`${AnsiGreen}✓${AnsiReset} ${testName}`);
      return true;
    }

    Logger.log(`${AnsiRed}✕${AnsiReset} ${testName}`);
    Logger.logGrayComment(`${orphanSpanLength} spans lack propagation`);

    let count = 0;
    for (const [traceId, spans] of Object.entries(orphanSpans)) {
      for (const span of spans) {
        if (!span.isRoot) continue;

        Logger.logGrayComment(`${count + 1}: ${JSON.stringify(span)}`);
        count++;
      }
    }

    return false;
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
