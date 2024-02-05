import { Config } from "@/config/config";
import {
  CoverageResult,
  HttpCoverage as HttpCoverageResult,
  RpcCoverage as RpcCoverageResult,
} from "@/coverage/coverageResult";
import { IReportFile } from "@/report/iReportFile";
import { TestCaseResult } from "@/testCaseResult";
import { TestResult } from "@/testResult";
import { OtelLogRecord } from "@/type/otelLogRecord";
import { OtelSpan } from "@/type/otelSpan";
import fs from "fs";
import path from "path";

type EchoedParam = {
  config: ReportConfig;
  testInfos: TestInfo[];
  coverageInfos: CoverageInfo[];
  propagationFailedTraces: PropagationFailedTrace[];
  traces: Trace[];
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
  httpCoverage?: HttpCoverage;
  rpcCoverage?: RpcCoverage;
  unmeasuredTraceIds?: string[];
};

type HttpCoverage = {
  operationCoverages: HttpOperationCoverage[];
  undocumentedOperations: HttpOperationTraces[];
};

type HttpOperation = {
  path: string;
  method: string;
};

type HttpOperationCoverage = HttpOperation & {
  passed: boolean;
};

type HttpOperationTraces = HttpOperation & {
  traceIds: string[];
};

type RpcCoverage = {
  methodCoverages: RpcMethodCoverage[];
  undocumentedMethods: RpcMethodTraces[];
};

type RpcMethod = {
  service: string;
  method: string;
};

type RpcMethodCoverage = RpcMethod & {
  passed: boolean;
};

type RpcMethodTraces = RpcMethod & {
  traceIds: string[];
};

type PropagationFailedTrace = {
  traceId: string;
};

type Trace = {
  traceId: string;
  spans: OtelSpan[];
  logRecords: OtelLogRecord[];
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

    const echoedParamText = this.escapeTagForHtmlEmbedJSON(
      JSON.stringify(echoedParam),
    );
    const fileContent = htmlContent.replace(
      /<!-- -z- replace:dummy start -z- -->.+<!-- -z- replace:dummy end -z- -->/s,
      `
    <script>
    window.__echoed_param__ = ${echoedParamText}
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

    const traces: Trace[] = [];
    for (const traceId of testResult.capturedSpans.keys()) {
      traces.push({
        traceId: traceId,
        spans: testResult.capturedSpans.get(traceId) ?? [],
        logRecords: testResult.capturedLogs.get(traceId) ?? [],
      });
    }

    return {
      testInfos,
      propagationFailedTraces,
      coverageInfos,
      config,
      traces,
    };
  }

  private buildTestInfos(testResult: TestResult): TestInfo[] {
    const results = [...testResult.testCaseResults.values()].flat();
    const testInfos = results.map((result) => {
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

  private buildPropagationFailedTraces(
    testResult: TestResult,
  ): PropagationFailedTrace[] {
    const propagationFailedTraces: PropagationFailedTrace[] = [];
    for (const traceId of testResult.propagationFailedSpans.keys()) {
      propagationFailedTraces.push({
        traceId: traceId,
      });
    }

    return propagationFailedTraces;
  }

  private buildCoverageInfos(coverageResult: CoverageResult): CoverageInfo[] {
    const coverageInfos: CoverageInfo[] = [];
    for (const coverage of coverageResult.coverages) {
      const coverageInfo: CoverageInfo = {
        serviceName: coverage.serviceName,
        serviceNamespace: coverage.serviceNamespace,
        httpCoverage: this.buildHttpCoverage(coverage.httpCoverage),
        rpcCoverage: this.buildRpcCoverage(coverage.rpcCoverage),
        unmeasuredTraceIds: coverage.unmeasuredTraceIds,
      };
      coverageInfos.push(coverageInfo);
    }

    return coverageInfos;
  }

  private buildHttpCoverage(
    httpCoverage: HttpCoverageResult | undefined,
  ): HttpCoverage | undefined {
    if (!httpCoverage) return undefined;

    const coverages = httpCoverage.operationCoverages.map((cov) => {
      return {
        path: cov.path,
        method: cov.method,
        passed: cov.passed,
      };
    });

    const undocumentedOperations = httpCoverage.undocumentedOperations.map(
      (cov) => {
        return {
          path: cov.path,
          method: cov.method,
          traceIds: cov.traceIds.map((v) => v.base64String),
        };
      },
    );

    return {
      operationCoverages: coverages,
      undocumentedOperations: undocumentedOperations,
    };
  }

  private buildRpcCoverage(
    rpcCoverage: RpcCoverageResult | undefined,
  ): RpcCoverage | undefined {
    if (!rpcCoverage) return undefined;

    const coverages = rpcCoverage.methodCoverages.map((cov) => {
      return {
        service: cov.service,
        method: cov.method,
        passed: cov.passed,
      };
    });

    const undocumentedOperations = rpcCoverage.undocumentedMethods.map(
      (cov) => {
        return {
          service: cov.service,
          method: cov.method,
          traceIds: cov.traceIds.map((v) => v.base64String),
        };
      },
    );

    return {
      methodCoverages: coverages,
      undocumentedMethods: undocumentedOperations,
    };
  }

  private buildReportConfig(): ReportConfig {
    return {
      propagationTestEnabled: this.config.propagationTestConfig.enabled,
    };
  }

  /**
   * Because when text like "<script" or "<!CDATA" exists inside text, HTML considered javascript is stopped.
   * To stop the separation, split the text and combine with "+" instead.
   *
   * For example, below HTML doesn't work as expected
   * ```
   * <script>
   * const json = {"hello": "good<script>world</script>"}
   * </script>
   * ```
   *
   * But the result of `escapeTagForHtmlEmbedJSON` is embeddable safely as tag is separated.
   * ```
   * <script>
   * const json = {"hello": "good<"+"script>world<"+"/script>"}
   * </script>
   * ```
   *
   * @example
   * escapeTagForHtmlEmbedJSON(`{"hello": "good<script>world</script>"}`)
   *   -> `{"hello": "good<"+"script>world<"+"/script>"}`
   */
  private escapeTagForHtmlEmbedJSON(json: string): string {
    return json.replace(/<(.)/g, `<"+"$1`);
  }
}
