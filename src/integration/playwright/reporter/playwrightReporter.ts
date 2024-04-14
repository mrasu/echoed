import { Config, ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { EchoedFatalError } from "@/echoedFatalError";
import { FileSpace } from "@/fileSpace/fileSpace";
import { FsContainer, buildFsContainerForApp } from "@/fs/fsContainer";
import { LocalFile } from "@/fs/localFile";
import { getTmpDirFromEnv } from "@/integration/common/util/env";
import { Reporter } from "@/integration/playwright/reporter/reporter";
import { Logger } from "@/logger";
import { ReportFile } from "@/report/reportFile";
import type {
  FullConfig,
  FullResult,
  Reporter as PlaywrightReporterInterface,
  TestCase as PlaywrightTestCase,
  TestResult as PlaywrightTestResult,
  Suite,
} from "@playwright/test/reporter";
import path from "path";

const ECHOED_ROOT_DIR = path.resolve(__dirname, "../../../");

const NOT_FILE_SPACE_INITIALIZED_ERROR_MESSAGE =
  "Echoed server is not initialized. not using globalSetup?";

export class PlaywrightReporter implements PlaywrightReporterInterface {
  private readonly reporter: Reporter;
  private readonly config: Config;
  private readonly fsContainer: FsContainer;

  constructor() {
    const fsContainer = buildFsContainerForApp();

    const configFilepath = path.join(process.cwd(), ECHOED_CONFIG_FILE_NAME);
    const configFile = new LocalFile(configFilepath);
    const config = Config.load(fsContainer, configFile);

    this.fsContainer = fsContainer;
    this.config = config;
    this.reporter = new Reporter(config);
  }

  printsToStdio(): boolean {
    return false;
  }

  onBegin(playwrightConfig: FullConfig, _suite: Suite): void {
    this.reporter.onBegin(playwrightConfig.rootDir);

    const fileSpace = this.getFileSpace();
    if (!fileSpace) {
      throw new EchoedFatalError(NOT_FILE_SPACE_INITIALIZED_ERROR_MESSAGE);
    }

    this.reporter.markFileSpaceInitializedBeforeStart();
  }

  onTestBegin(
    testCase: PlaywrightTestCase,
    result: PlaywrightTestResult,
  ): void {
    this.reporter.onTestBegin(testCase, result);
  }

  onTestEnd(test: PlaywrightTestCase, result: PlaywrightTestResult): void {
    this.reporter.onTestEnd(test, result);
  }

  async onEnd(result: FullResult): Promise<{ status: FullResult["status"] }> {
    if (!this.reporter.isFileSpaceInitializedBeforeStart) {
      Logger.error(NOT_FILE_SPACE_INITIALIZED_ERROR_MESSAGE);
      return { status: "failed" };
    }

    const fileSpace = this.getFileSpace();
    if (!fileSpace) {
      Logger.error(NOT_FILE_SPACE_INITIALIZED_ERROR_MESSAGE);
      return { status: "failed" };
    }

    const reportFile = new ReportFile(
      this.config,
      this.fsContainer.newDirectory(ECHOED_ROOT_DIR),
    );

    return await this.reporter.onEnd(result, fileSpace, reportFile);
  }

  private getFileSpace(): FileSpace | undefined {
    const tmpdir = getTmpDirFromEnv();

    if (!tmpdir) {
      return;
    }

    return new FileSpace(this.fsContainer.newDirectory(tmpdir));
  }
}
