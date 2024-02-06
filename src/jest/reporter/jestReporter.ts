import { Config, ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { EchoedError } from "@/echoedError";
import { Reporter } from "@/jest/reporter/reporter";
import { Logger } from "@/logger";
import { ReportFile } from "@/report/reportFile";
import {
  AggregatedResult,
  Reporter as IJestReporter,
  Config as JestReporterConfig,
  ReporterOnStartOptions,
  SummaryReporterOptions,
} from "@jest/reporters";
import { Test, TestCaseResult, TestContext } from "@jest/test-result";
import { Circus } from "@jest/types";
import path from "path";

const ECHOED_ROOT_DIR = path.resolve(__dirname, "../../");

export class JestReporter implements IJestReporter {
  private readonly reporter: Reporter;
  private readonly config: Config;

  constructor(
    globalConfig: JestReporterConfig.GlobalConfig,
    _option: SummaryReporterOptions,
  ) {
    try {
      const filepath = path.join(process.cwd(), ECHOED_CONFIG_FILE_NAME);
      const config = Config.load(filepath);

      this.config = config;
      this.reporter = new Reporter(globalConfig, this.config);
    } catch (e) {
      this.throwError(e);
    }
  }

  async onRunStart(
    results: AggregatedResult,
    options: ReporterOnStartOptions,
  ): Promise<void> {
    await this.run(async () => {
      await this.reporter.onRunStart(results, options);
    });
  }

  readonly getLastError = (): Error | void => {
    this.reporter.getLastError();
  };

  async onRunComplete(
    contexts: Set<TestContext>,
    results: AggregatedResult,
  ): Promise<void> {
    const reportFile = new ReportFile(this.config, ECHOED_ROOT_DIR);

    await this.run(async () => {
      await this.reporter.onRunComplete(contexts, results, reportFile);
    });
  }

  async onTestCaseStart(
    test: Test,
    testCaseStartInfo: Circus.TestCaseStartInfo,
  ): Promise<void> {
    await this.run(async () => {
      await this.reporter.onTestCaseStart(test, testCaseStartInfo);
    });
  }

  async onTestCaseResult(
    test: Test,
    testCaseResult: TestCaseResult,
  ): Promise<void> {
    await this.run(async () => {
      await this.reporter.onTestCaseResult(test, testCaseResult);
    });
  }

  private async run(fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch (e) {
      this.throwError(e);
    }
  }

  private throwError(e: unknown): never {
    if (e instanceof EchoedError) {
      // Add new line to emphasize message.
      // Because long message including stacktrace will be printed after `throw e`, we need to emphasize message somehow.
      Logger.ln(2);
      Logger.error(e.message);
      Logger.ln(2);
    }

    throw e;
  }
}
