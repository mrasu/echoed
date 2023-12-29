import fs from "fs";
import path from "path";
import { TobikuraSpan } from "@/type/tobikuraSpan";
import { ITobikuraLogRecord } from "@/types";
import { TestResult } from "@/testResult";
import { TestCaseResult } from "@/testCaseResult";
import { TobikuraConfig } from "@/config/tobikuraConfig";
import { IReportFile } from "@/report/iReportFile";

type TobikuraParam = {
  config: ReportConfig;
  testInfos: TestInfo[];
  propagationFailedTraces: Trace[];
};

export type ReportConfig = {
  propagationTestEnabled: boolean;
};

type TestInfo = {
  testId: string;
  file: string;
  name: string;
  startTimeMillis: number;
  status: string;
  orderedTraceIds: string[];
  fetches: Fetch[];
  failureDetails?: string[];
  failureMessages?: string[];
  duration?: number;
  spans: TobikuraSpan[];
  logRecords: any[];
};

type Fetch = {
  traceId: string;
  request: FetchRequest;
  response: FetchResponse;
};

type FetchRequest = {
  url: string;
  method: string;
  body?: string;
};

type FetchResponse = {
  status: number;
  body?: string;
};

type Trace = {
  traceId: string;
  spans: TobikuraSpan[];
  logRecords: any[];
};

const REPORT_HTML_TEMPLATE_PATH_FROM_ROOT_DIR = "reporter/dist/index.html";

export class ReportFile implements IReportFile {
  constructor(
    private outputFilePath: string,
    private tobikuraRootDir: string,
    private config: TobikuraConfig,
  ) {}

  async generate(testResult: TestResult): Promise<string> {
    const reportHtmlPath = path.resolve(
      this.tobikuraRootDir,
      REPORT_HTML_TEMPLATE_PATH_FROM_ROOT_DIR,
    );
    const htmlContent = await fs.promises.readFile(reportHtmlPath, "utf-8");

    const tobikuraParam = this.createTobikuraParam(testResult);

    const fileContent = htmlContent.replace(
      /<!-- -z- replace:dummy start -z- -->.+<!-- -z- replace:dummy end -z- -->/s,
      `
    <script>
    window.__tobikura_param__ = ${JSON.stringify(tobikuraParam)}
    </script>
    `,
    );

    await fs.promises.mkdir(path.dirname(this.outputFilePath), {
      recursive: true,
    });
    await fs.promises.writeFile(this.outputFilePath, fileContent, "utf-8");

    return this.outputFilePath;
  }

  private createTobikuraParam(testResult: TestResult): TobikuraParam {
    const results = [...testResult.testCaseResults.values()].flat();
    const testInfos = results.map((result) => {
      let traceSpans: TobikuraSpan[] = [];
      let traceLogs: ITobikuraLogRecord[] = [];

      for (const traceId of result.orderedTraceIds) {
        traceSpans = traceSpans.concat(testResult.capturedSpans[traceId] || []);
        traceLogs = traceLogs.concat(testResult.capturedLogs[traceId] || []);
      }

      const testInfo: TestInfo = {
        testId: result.testId,
        file: result.file,
        name: result.name,
        startTimeMillis: result.startTimeMillis,
        status: result.status,
        orderedTraceIds: result.orderedTraceIds,
        fetches: this.toFetches(result),
        failureDetails: result.failureDetails,
        failureMessages: result.failureMessages,
        duration: result.duration,
        spans: traceSpans,
        logRecords: traceLogs,
      };
      return testInfo;
    });

    const propagationFailedTraces: Trace[] = [];
    for (const traceId of Object.keys(testResult.propagationFailedSpans)) {
      propagationFailedTraces.push({
        traceId: traceId,
        spans: testResult.propagationFailedSpans[traceId],
        logRecords: testResult.capturedLogs[traceId] || [],
      });
    }

    return {
      testInfos,
      propagationFailedTraces,
      config: this.buildReportConfig(),
    };
  }

  private toFetches(testCaseResult: TestCaseResult): Fetch[] {
    return testCaseResult.fetches.map((fetch): Fetch => {
      return {
        traceId: fetch.traceId,
        request: { ...fetch.request },
        response: { ...fetch.response },
      };
    });
  }

  private buildReportConfig(): ReportConfig {
    return {
      propagationTestEnabled: this.config.propagationTestConfig.enabled,
    };
  }
}
