import { Config } from "@/config/config";
import {
  CoverageResult,
  HttpCoverage as HttpCoverageResult,
  RpcCoverage as RpcCoverageResult,
} from "@/coverage/coverageResult";
import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";
import { IReportFile } from "@/report/iReportFile";
import { OtelLogRecordConverter } from "@/report/otelLogRecordConverter";
import { OtelSpanConverter } from "@/report/otelSpanConverter";
import { TestCaseResult } from "@/testCaseResult";
import { TestResult } from "@/testResult";
import {
  IConfig,
  ICoverageInfo,
  IEchoedParam,
  IFetch,
  IHttpCoverage,
  IPropagationFailedTrace,
  IRpcCoverage,
  ITestInfo,
  ITrace,
} from "@shared/type/echoedParam";

const REPORT_HTML_TEMPLATE_PATH_FROM_ROOT_DIR = "reporter/dist/index.html";

export class ReportFile implements IReportFile {
  constructor(
    private config: Config,
    private echoedRootDir: IDirectory,
  ) {}

  async generate(
    testResult: TestResult,
    coverageResult: CoverageResult,
  ): Promise<IFile> {
    const reportHtmlFile = this.echoedRootDir.newFile(
      REPORT_HTML_TEMPLATE_PATH_FROM_ROOT_DIR,
    );
    const htmlContent = await reportHtmlFile.read();

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
    await outputPath.ensureDir();
    await outputPath.write(fileContent);

    return outputPath;
  }

  private createEchoedParam(
    testResult: TestResult,
    coverageResult: CoverageResult,
  ): IEchoedParam {
    const testInfos = this.buildTestInfos(testResult);
    const propagationFailedTraces =
      this.buildPropagationFailedTraces(testResult);
    const coverageInfos = this.buildCoverageInfos(coverageResult);
    const config = this.buildReportConfig();

    const traces: ITrace[] = [];
    for (const traceId of testResult.capturedSpans.keys()) {
      traces.push({
        traceId: traceId,
        spans: OtelSpanConverter.convertAll(
          testResult.capturedSpans.get(traceId) ?? [],
        ),
        logRecords: OtelLogRecordConverter.convertAll(
          testResult.capturedLogs.get(traceId) ?? [],
        ),
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

  private buildTestInfos(testResult: TestResult): ITestInfo[] {
    const results = [...testResult.testCaseResults.values()].flat();
    const testInfos = results.map((result) => {
      const testInfo: ITestInfo = {
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

  private toFetches(testCaseResult: TestCaseResult): IFetch[] {
    return testCaseResult.fetches.map((fetch): IFetch => {
      return {
        traceId: fetch.traceId,
        request: { ...fetch.request },
        response: { ...fetch.response },
      };
    });
  }

  private buildPropagationFailedTraces(
    testResult: TestResult,
  ): IPropagationFailedTrace[] {
    const propagationFailedTraces: IPropagationFailedTrace[] = [];
    for (const traceId of testResult.propagationFailedSpans.keys()) {
      propagationFailedTraces.push({
        traceId: traceId,
      });
    }

    return propagationFailedTraces;
  }

  private buildCoverageInfos(coverageResult: CoverageResult): ICoverageInfo[] {
    const coverageInfos: ICoverageInfo[] = [];
    for (const coverage of coverageResult.coverages) {
      const coverageInfo: ICoverageInfo = {
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
  ): IHttpCoverage | undefined {
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
          traceIds: cov.traceIds.map((v) => v.hexString),
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
  ): IRpcCoverage | undefined {
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
          traceIds: cov.traceIds.map((v) => v.hexString),
        };
      },
    );

    return {
      methodCoverages: coverages,
      undocumentedMethods: undocumentedOperations,
    };
  }

  private buildReportConfig(): IConfig {
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
