import { Config } from "@/config/config";
import { EchoedFatalError } from "@/echoedFatalError";
import { FileSpace } from "@/fileSpace/fileSpace";
import { IDirectory } from "@/fs/iDirectory";
import {
  analyzeCoverage,
  logFileCreated,
  logPropagationTestResult,
} from "@/integration/common/util/reporter";
import { IReportFile } from "@/report/iReportFile";
import { TestFailedError } from "@/report/testFailedError";
import { TestResult } from "@/report/testResult";
import { IServer } from "@/server/iServer";

export class EventListener {
  server: IServer | undefined;
  fileSpace: FileSpace | undefined;

  private setupCalled = false;

  constructor(
    private cwd: string,
    private echoedConfig: Config,
    private serverStartFn: (port: number) => Promise<IServer>,
  ) {}

  async onBeforeRun(tmpdir: IDirectory): Promise<void> {
    await this.runSetup(tmpdir);
  }

  async onBeforeBrowserLaunch(tmpdir: IDirectory): Promise<void> {
    if (this.setupCalled) return;

    await this.runSetup(tmpdir);
  }

  private async runSetup(tmpdir: IDirectory): Promise<void> {
    this.fileSpace = new FileSpace(tmpdir);
    this.fileSpace.ensureDirectoryExistence();

    const serverPort = this.echoedConfig.serverPort;
    this.server = await this.serverStartFn(serverPort);

    this.setupCalled = true;
  }

  async onAfterRun(reportFile: IReportFile): Promise<void> {
    const server = this.server;
    if (!server) {
      throw new EchoedFatalError("Server is not started");
    }
    const fileSpace = this.fileSpace;
    if (!fileSpace) {
      throw new EchoedFatalError("FileSpace is not initialized");
    }

    await this.generateReport(reportFile, server, fileSpace);
  }

  private async generateReport(
    reportFile: IReportFile,
    server: IServer,
    fileSpace: FileSpace,
  ): Promise<void> {
    const serverStopAfter = this.echoedConfig.serverStopAfter;
    const { capturedSpans, capturedLogs, capturedTestCases } =
      await server.stopAfter(serverStopAfter);

    const testResult = await TestResult.collect(
      this.cwd,
      fileSpace.testLogDir,
      capturedSpans,
      capturedLogs,
      this.echoedConfig,
      capturedTestCases,
    );
    const coverageResult = await analyzeCoverage(
      this.echoedConfig,
      capturedSpans,
    );

    const outFile = await reportFile.generate(testResult, coverageResult);

    if (this.echoedConfig.propagationTestConfig.enabled) {
      const passed = logPropagationTestResult(testResult);

      logFileCreated(outFile);
      if (!passed) {
        // Throw error to exit with a non-zero status code. No other way found.
        throw new TestFailedError("Propagation leak found");
      }
    }

    logFileCreated(outFile);
  }
}
