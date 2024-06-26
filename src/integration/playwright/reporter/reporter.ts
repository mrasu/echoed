import { Config } from "@/config/config";
import { FileSpace } from "@/fileSpace/fileSpace";
import { opentelemetry } from "@/generated/otelpbj";
import {
  analyzeCoverage,
  logFileCreated,
  logPropagationTestResult,
} from "@/integration/common/util/reporter";
import { TestCaseStartInfo } from "@/integration/jest/reporter/testCase";
import { Logger } from "@/logger";
import { IReportFile } from "@/report/iReportFile";
import { TestResult } from "@/report/testResult";
import { OtelLogRecord } from "@/type/otelLogRecord";
import { JsonOtelSpan, OtelSpan } from "@/type/otelSpan";
import { TestCase } from "@/type/testCase";
import { omitDirPath } from "@/util/file";
import { type FullResult } from "@playwright/test/reporter";
import type {
  TestCase as PlaywrightTestCase,
  TestResult as PlaywrightTestResult,
} from "playwright/types/testReporter";

export class Reporter {
  private readonly config: Config;
  private playwrightRootDir: string | undefined;
  private fileSpaceInitializedBeforeStart = false;

  private testCaseStartInfos = new Map<string, TestCaseStartInfo>();
  collectedTestCaseElements = new Map<string, TestCase[]>();

  constructor(config: Config) {
    this.config = config;
  }

  onBegin(rootDir: string): void {
    this.playwrightRootDir = rootDir;
  }

  markFileSpaceInitializedBeforeStart(): void {
    this.fileSpaceInitializedBeforeStart = true;
  }

  get isFileSpaceInitializedBeforeStart(): boolean {
    return this.fileSpaceInitializedBeforeStart;
  }

  onTestBegin(test: PlaywrightTestCase, result: PlaywrightTestResult): void {
    const testName = test
      .titlePath()
      .filter((v) => v)
      .join(" > ");

    const startInfo = new TestCaseStartInfo(
      test.id,
      omitDirPath(test.location.file, this.playwrightRootDir!),
      testName,
      result.startTime.getTime(),
    );

    this.testCaseStartInfos.set(test.id, startInfo);
  }

  onTestEnd(test: PlaywrightTestCase, result: PlaywrightTestResult): void {
    const testCaseStartInfo = this.testCaseStartInfos.get(test.id);
    if (!testCaseStartInfo) return;

    const failureDetails = result.errors.map((e) => {
      const loc = e.location
        ? `${e.location.file}:${e.location.line}:${e.location.column}`
        : null;

      return JSON.stringify({
        message: e.message,
        value: e.value,
        snippet: e.snippet,
        stack: e.stack,
        location: loc,
      });
    });

    const testCase = testCaseStartInfo.toTestCaseElement(
      result.status,
      result.duration,
      // Because Playwright starts the next test without waiting for `onTestEnd`, we cannot find exact test finished time. Instead, use `startTimeMillis + duration` as finished time.
      testCaseStartInfo.startTimeMillis + result.duration,
      failureDetails,
      result.errors.map((e) => e.message ?? "").filter((v) => v),
    );

    const collected = this.collectedTestCaseElements.get(testCase.file) || [];
    collected.push(testCase);
    this.collectedTestCaseElements.set(testCase.file, collected);
  }

  async onEnd(
    result: FullResult,
    fileSpace: FileSpace,
    reportFile: IReportFile,
  ): Promise<{ status: FullResult["status"] }> {
    const capturedSpans = await this.readStoredOtelSpans(fileSpace);
    const capturedLogs = await this.readStoredOtelLogRecords(fileSpace);

    const testResult = await TestResult.collect(
      this.playwrightRootDir!,
      fileSpace.testLogDir,
      capturedSpans,
      capturedLogs,
      this.config,
      this.collectedTestCaseElements,
    );
    const coverageResult = await analyzeCoverage(this.config, capturedSpans);

    const outFile = await reportFile.generate(testResult, coverageResult);

    let resultStatus = result.status;
    if (this.config.propagationTestConfig.enabled) {
      const passed = logPropagationTestResult(testResult);
      if (!passed) {
        if (resultStatus === "passed") {
          resultStatus = "failed";
        }
        Logger.error("Propagation leak found");
      }
    }

    logFileCreated(outFile);

    return { status: resultStatus };
  }

  private async readStoredOtelSpans(
    fileSpace: FileSpace,
  ): Promise<Map<string, OtelSpan[]>> {
    const spansText = await fileSpace.otelDir.spanFile.read();
    const spanRecords = Object.entries(
      JSON.parse(spansText) as Record<string, JsonOtelSpan[]>,
    );
    const spans = new Map<string, OtelSpan[]>();
    for (const [traceId, otelSpans] of spanRecords) {
      spans.set(traceId, OtelSpan.fromObjects(otelSpans));
    }

    return spans;
  }

  private async readStoredOtelLogRecords(
    fileSpace: FileSpace,
  ): Promise<Map<string, OtelLogRecord[]>> {
    const logsText = await fileSpace.otelDir.logFile.read();
    const logsRecords = Object.entries(
      JSON.parse(logsText) as Record<
        string,
        opentelemetry.proto.logs.v1.ILogRecord[]
      >,
    );
    const logs = new Map<string, OtelLogRecord[]>();
    for (const [traceId, otelLogs] of logsRecords) {
      logs.set(traceId, OtelLogRecord.fromJsonLogs(otelLogs));
    }

    return logs;
  }
}
