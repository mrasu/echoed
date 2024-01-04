import fs from "fs";
import path from "path";
import { OtelSpan } from "@/type/otelSpan";
import { IOtelLogRecord } from "@/types";
import { TestResult } from "@/testResult";
import { TestCaseResult } from "@/testCaseResult";
import { Config } from "@/config/config";
import { IReportFile } from "@/report/iReportFile";
import { CoverageResult } from "@/coverage/coverageResult";

type EchoedParam = {
  config: ReportConfig;
  testInfos: TestInfo[];
  coverageInfos: CoverageInfo[];
  propagationFailedTraces: Trace[];
};

type ReportConfig = {
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
  spans: OtelSpan[];
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

type CoverageInfo = {
  serviceName: string;
  serviceNamespace: string | undefined;
  http: HttpCoverage;
};

type HttpCoverage = {
  operationCoverages: HttpOperationCoverage[];
};

type HttpOperationCoverage = {
  path: string;
  method: string;
  passed: boolean;
};

type Trace = {
  traceId: string;
  spans: OtelSpan[];
  logRecords: any[];
};

const REPORT_HTML_TEMPLATE_PATH_FROM_ROOT_DIR = "reporter/dist/index.html";

export class ReportFile implements IReportFile {
  constructor(
    private config: Config,
    private echoedRootDir: string,
  ) {}

  async generate(
    testResult: TestResult,
    coverageResult: CoverageResult,
  ): Promise<string> {
    const reportHtmlPath = path.resolve(
      this.echoedRootDir,
      REPORT_HTML_TEMPLATE_PATH_FROM_ROOT_DIR,
    );
    const htmlContent = await fs.promises.readFile(reportHtmlPath, "utf-8");

    const echoedParam = this.createEchoedParam(testResult, coverageResult);

    const fileContent = htmlContent.replace(
      /<!-- -z- replace:dummy start -z- -->.+<!-- -z- replace:dummy end -z- -->/s,
      `
    <script>
    window.__echoed_param__ = ${JSON.stringify(echoedParam)}
    </script>
    `,
    );

    const outputPath = this.config.output;
    await fs.promises.mkdir(path.dirname(outputPath), {
      recursive: true,
    });
    await fs.promises.writeFile(outputPath, fileContent, "utf-8");

    return outputPath;
  }

  private createEchoedParam(
    testResult: TestResult,
    coverageResult: CoverageResult,
  ): EchoedParam {
    const testInfos = this.buildTestInfos(testResult);
    const propagationFailedTraces =
      this.buildPropagationFailedTraces(testResult);
    const coverageInfos = this.buildCoverageInfos(coverageResult);
    const config = this.buildReportConfig();

    return {
      testInfos,
      propagationFailedTraces,
      coverageInfos,
      config,
    };
  }

  private buildTestInfos(testResult: TestResult) {
    const results = [...testResult.testCaseResults.values()].flat();
    const testInfos = results.map((result) => {
      let traceSpans: OtelSpan[] = [];
      let traceLogs: IOtelLogRecord[] = [];

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

    return testInfos;
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

  private buildPropagationFailedTraces(testResult: TestResult): Trace[] {
    const propagationFailedTraces: Trace[] = [];
    for (const traceId of Object.keys(testResult.propagationFailedSpans)) {
      propagationFailedTraces.push({
        traceId: traceId,
        spans: testResult.propagationFailedSpans[traceId],
        logRecords: testResult.capturedLogs[traceId] || [],
      });
    }

    return propagationFailedTraces;
  }

  private buildCoverageInfos(coverageResult: CoverageResult): CoverageInfo[] {
    const coverageInfos: CoverageInfo[] = [];
    for (const coverage of coverageResult.coverages) {
      const pathCoverages = coverage.http.operationCoverages.map((cov) => {
        return {
          path: cov.path,
          method: cov.method,
          passed: cov.passed,
        };
      });

      const coverageInfo: CoverageInfo = {
        serviceName: coverage.serviceName,
        serviceNamespace: coverage.serviceNamespace,
        http: { operationCoverages: pathCoverages },
      };
      coverageInfos.push(coverageInfo);
    }

    return coverageInfos;
  }

  private buildReportConfig(): ReportConfig {
    return {
      propagationTestEnabled: this.config.propagationTestConfig.enabled,
    };
  }
}
