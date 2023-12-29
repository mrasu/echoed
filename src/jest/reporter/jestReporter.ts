import path from "path";
import { ReportFile } from "@/report/reportFile";
import {
  AggregatedResult,
  Config,
  Reporter as IJestReporter,
  ReporterOnStartOptions,
} from "@jest/reporters";
import { Test, TestCaseResult, TestContext } from "@jest/test-result";
import { Circus } from "@jest/types";
import { PropagationTestConfig, Reporter } from "@/jest/reporter/reporter";

const TOBIKURA_ROOT_DIR = path.resolve(__dirname, "../../");

export class JestReporter implements IJestReporter {
  private reporter: Reporter;

  constructor(
    globalConfig: Config.GlobalConfig,
    option: {
      output?: string;
      serverPort?: number;
      serverStopAfter?: number;
      debug?: boolean;
      propagationTest?: PropagationTestConfig;
    },
  ) {
    this.reporter = new Reporter(globalConfig, option);
  }

  async onRunStart(results: AggregatedResult, options: ReporterOnStartOptions) {
    await this.reporter.onRunStart(results, options);
  }

  readonly getLastError = () => {
    this.reporter.getLastError();
  };

  async onRunComplete(contexts: Set<TestContext>, results: AggregatedResult) {
    const reportFile = new ReportFile(
      this.reporter.output,
      TOBIKURA_ROOT_DIR,
      this.reporter.config,
    );
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
