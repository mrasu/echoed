import path from "path";
import { ReportFile } from "@/report/reportFile";
import {
  AggregatedResult,
  Config as JestReporterConfig,
  Reporter as IJestReporter,
  ReporterOnStartOptions,
  SummaryReporterOptions,
} from "@jest/reporters";
import { Test, TestCaseResult, TestContext } from "@jest/test-result";
import { Circus } from "@jest/types";
import { Reporter } from "@/jest/reporter/reporter";
import { Config } from "@/config/config";

const ECHOED_ROOT_DIR = path.resolve(__dirname, "../../");
const ECHOED_CONFIG_FILE_NAME = ".echoed.yml";

export class JestReporter implements IJestReporter {
  private readonly reporter: Reporter;
  private readonly config: Config;

  constructor(
    globalConfig: JestReporterConfig.GlobalConfig,
    _option: SummaryReporterOptions,
  ) {
    const filepath = path.join(process.cwd(), ECHOED_CONFIG_FILE_NAME);
    const config = Config.load(filepath);

    this.config = config;
    this.reporter = new Reporter(globalConfig, this.config);
  }

  async onRunStart(results: AggregatedResult, options: ReporterOnStartOptions) {
    await this.reporter.onRunStart(results, options);
  }

  readonly getLastError = () => {
    this.reporter.getLastError();
  };

  async onRunComplete(contexts: Set<TestContext>, results: AggregatedResult) {
    const reportFile = new ReportFile(this.config, ECHOED_ROOT_DIR);
    await this.reporter.onRunComplete(contexts, results, reportFile);
  }

  async onTestCaseStart(
    test: Test,
    testCaseStartInfo: Circus.TestCaseStartInfo,
  ) {
    await this.reporter.onTestCaseStart(test, testCaseStartInfo);
  }

  async onTestCaseResult(test: Test, testCaseResult: TestCaseResult) {
    await this.reporter.onTestCaseResult(test, testCaseResult);
  }
}
