import { Config, ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { FsContainer, buildFsContainerForApp } from "@/fs/fsContainer";
import { LocalFile } from "@/fs/localFile";
import { throwError } from "@/integration/common/util/error";
import { Reporter } from "@/integration/jest/reporter/reporter";
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

const ECHOED_ROOT_DIR = path.resolve(__dirname, "../../../");

export class JestReporter implements IJestReporter {
  private readonly reporter: Reporter;
  private readonly config: Config;
  private readonly fsContainer: FsContainer;

  constructor(
    globalConfig: JestReporterConfig.GlobalConfig,
    _option: SummaryReporterOptions,
  ) {
    this.fsContainer = buildFsContainerForApp();

    try {
      const configFilepath = path.join(process.cwd(), ECHOED_CONFIG_FILE_NAME);
      const configFile = new LocalFile(configFilepath);
      const config = Config.load(this.fsContainer, configFile);

      this.config = config;

      this.reporter = new Reporter(this.fsContainer, globalConfig, this.config);
    } catch (e) {
      throwError(e);
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
    const reportFile = new ReportFile(
      this.config,
      this.fsContainer.newDirectory(ECHOED_ROOT_DIR),
    );

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
      throwError(e);
    }
  }
}
