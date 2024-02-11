import { Config } from "@/config/config";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { FetchInfo } from "@/fetchInfo";
import { IFile } from "@/fs/IFile";
import { IDirectory } from "@/fs/iDirectory";
import { opentelemetry } from "@/generated/otelpbj";
import { Logger } from "@/logger";
import { TestCase } from "@/testCase";
import { TestCaseResult } from "@/testCaseResult";
import { OtelLogRecord } from "@/type/otelLogRecord";
import { OtelSpan } from "@/type/otelSpan";
import { FetchFinishedLog, FetchStartedLog, Log } from "@/types";
import { omitDirPath } from "@/util/file";
import { neverVisit } from "@/util/never";

const SpanKind = opentelemetry.proto.trace.v1.Span.SpanKind;

const PropagationRequiredKinds = new Set([
  SpanKind.SPAN_KIND_SERVER,
  SpanKind.SPAN_KIND_CONSUMER,
]);

function isPropagationRequiredSpan(span: OtelSpan): boolean {
  if (span.kind) {
    if (!PropagationRequiredKinds.has(span.kind)) {
      return false;
    }
  }

  if (!span.isRoot) return false;

  return true;
}

function extractPropagationFailedSpans(
  propagationTestConfig: PropagationTestConfig,
  allSpans: Map<string, OtelSpan[]>,
): Map<string, OtelSpan[]> {
  const propagationFailedTraceIds: Set<string> = new Set();

  for (const [traceId, spanList] of allSpans.entries()) {
    for (const span of spanList) {
      if (!isPropagationRequiredSpan(span)) continue;
      if (span.shouldIgnoreFromPropagationTest(propagationTestConfig)) {
        continue;
      }

      propagationFailedTraceIds.add(traceId);
      break;
    }
  }

  const propagationFailedSpans = new Map<string, OtelSpan[]>();

  for (const [traceId, spanList] of allSpans.entries()) {
    if (propagationFailedTraceIds.has(traceId)) {
      propagationFailedSpans.set(traceId, spanList);
    }
  }

  return propagationFailedSpans;
}

export class TestResult {
  public testCaseResults: Map<string, TestCaseResult[]>;
  public capturedSpans: Map<string, OtelSpan[]>;
  public propagationFailedSpans: Map<string, OtelSpan[]>;
  public capturedLogs: Map<string, OtelLogRecord[]>;

  static async collect(
    testRootDir: string,
    tmpLogDir: IDirectory,
    capturedSpans: Map<string, OtelSpan[]>,
    capturedLogs: Map<string, OtelLogRecord[]>,
    config: Config,
    testCases: Map<string, TestCase[]>,
  ): Promise<TestResult> {
    const collector = new TestCaseLogCollector(testRootDir, tmpLogDir);
    const testCaseResults = await collector.collect(testCases);

    return new TestResult(testCaseResults, capturedSpans, capturedLogs, config);
  }

  constructor(
    testCaseResults: Map<string, TestCaseResult[]>,
    capturedSpans: Map<string, OtelSpan[]>,
    capturedLogs: Map<string, OtelLogRecord[]>,
    config: Config,
  ) {
    this.testCaseResults = testCaseResults;
    this.capturedLogs = capturedLogs;
    this.capturedSpans = capturedSpans;

    const propagationFailedSpans = extractPropagationFailedSpans(
      config.propagationTestConfig,
      capturedSpans,
    );
    this.propagationFailedSpans = propagationFailedSpans;
  }

  get propagationFailedRootSpans(): OtelSpan[] {
    const rootSpans: OtelSpan[] = [];
    for (const spans of this.propagationFailedSpans.values()) {
      for (const span of spans) {
        if (!span.isRoot) continue;

        rootSpans.push(span);
      }
    }

    return rootSpans;
  }
}

class TestCaseLogCollector {
  constructor(
    private testRootDir: string,
    private tmpLogDir: IDirectory,
  ) {}

  async collect(
    testCases: Map<string, TestCase[]>,
  ): Promise<Map<string, TestCaseResult[]>> {
    const logs = await this.readLogs();
    const testCaseResults = this.toTestCaseResults(testCases, logs);
    return testCaseResults;
  }

  private async readLogs(): Promise<Log[]> {
    const logFiles = await this.tmpLogDir.readdir();

    const rawLogs = logFiles
      .map((file: IFile) => file.readSync().split("\n"))
      .flat();

    const logs: Log[] = [];
    rawLogs.forEach((rawLog: string) => {
      let logJson: unknown;
      try {
        logJson = JSON.parse(rawLog);
      } catch (e) {
        return;
      }
      const parsed = Log.parse(logJson);

      if (parsed.type === "fetchStarted") {
        logs.push({
          type: "fetchStarted",
          timeMillis: parsed.timeMillis,
          traceId: parsed.traceId,
          testPath: parsed.testPath,
        });
      } else if (parsed.type === "fetchFinished") {
        logs.push({
          type: "fetchFinished",
          traceId: parsed.traceId,
          request: {
            url: parsed.request.url,
            method: parsed.request.method,
            body: parsed.request.body ?? undefined,
          },
          response: {
            status: parsed.response.status,
            body: parsed.response.body ?? undefined,
          },
        });
      } else {
        neverVisit("unknown log type found: ", parsed);
      }
    });

    return logs;
  }

  private toTestCaseResults(
    testCasesMap: Map<string, TestCase[]>,
    logs: Log[],
  ): Map<string, TestCaseResult[]> {
    const fetchInfoMap = this.buildFetchInfoMapFor(testCasesMap, logs);

    const ret = new Map<string, TestCaseResult[]>();
    for (const [file, testCases] of testCasesMap.entries()) {
      const results = testCases.map((testCase) => {
        const fetchInfos = fetchInfoMap.get(testCase.testId) || [];
        const orderedTraceIds = fetchInfos.map((f) => f.traceId);
        return testCase.toResult(orderedTraceIds, fetchInfos);
      });
      ret.set(file, results);
    }

    return ret;
  }

  /**
   * buildFetchInfoMapFor returns a map from testId to FetchInfo[].
   */
  private buildFetchInfoMapFor(
    testCases: Map<string, TestCase[]>,
    logs: Log[],
  ): Map<string, FetchInfo[]> {
    const fetchFinishedLogMap = this.extractFetchFinishedLogs(logs);
    const seeker = new TestCaseSeeker(this.testRootDir, testCases);

    const ret = new Map<string, FetchInfo[]>();

    const fetchStartedLogs = this.extractOrderedFetchStartedLogs(logs);
    for (const log of fetchStartedLogs) {
      const fetchFinishedLog = fetchFinishedLogMap.get(log.traceId);
      if (!fetchFinishedLog) {
        Logger.error("Invalid state: fetchFinishedLog not found", log);
        continue;
      }

      const testCase = seeker.seekCorrespondingTestCase(log);
      if (!testCase) continue;

      const fetch: FetchInfo = {
        traceId: fetchFinishedLog.traceId,
        request: {
          url: fetchFinishedLog.request.url,
          method: fetchFinishedLog.request.method,
          body: fetchFinishedLog.request.body,
        },
        response: {
          status: fetchFinishedLog.response.status,
          body: fetchFinishedLog.response.body,
        },
      };

      const fetches = ret.get(testCase.testId) ?? [];
      fetches.push(fetch);
      ret.set(testCase.testId, fetches);
    }

    return ret;
  }

  private extractOrderedFetchStartedLogs(logs: Log[]): FetchStartedLog[] {
    const ret: FetchStartedLog[] = [];
    for (const log of logs) {
      if (log.type === "fetchStarted") {
        ret.push(log);
      }
    }

    ret.sort((a, b) => {
      return a.timeMillis - b.timeMillis;
    });

    return ret;
  }

  private extractFetchFinishedLogs(logs: Log[]): Map<string, FetchFinishedLog> {
    const fetchFinishedLogs: FetchFinishedLog[] = [];
    for (const log of logs) {
      if (log.type !== "fetchFinished") {
        continue;
      }
      fetchFinishedLogs.push(log);
    }

    const ret = new Map<string, FetchFinishedLog>(
      fetchFinishedLogs.map((log) => [log.traceId, log]),
    );
    return ret;
  }
}

class TestCaseSeeker {
  private readonly testRootDir: string;
  private currentTestIndexes: Map<string, number>;
  private testCases: Map<string, TestCase[]>;

  constructor(testRootDir: string, testCases: Map<string, TestCase[]>) {
    this.testRootDir = testRootDir;
    this.testCases = testCases;
    this.currentTestIndexes = new Map(
      [...testCases.keys()].map((file) => [file, 0]),
    );
  }

  /**
   * seekCorrespondingTestCase returns a TestCase that corresponds to the given fetchLog.
   *
   * When multiple TestCase started at the same time, the last testCase is returned.
   * This comes from below assumptions,
   * * Fetch takes longer than one millisecond
   * * Test doesn't finish in the same millisecond.
   * So, tests using fetch won't have the same started time with other tests.
   */
  seekCorrespondingTestCase(fetchLog: FetchStartedLog): TestCase | undefined {
    const testFile = omitDirPath(fetchLog.testPath, this.testRootDir);
    const testCases = this.testCases.get(testFile);
    if (!testCases) {
      return undefined;
    }

    const startIndex = this.currentTestIndexes.get(testFile);
    if (startIndex === undefined) {
      return undefined;
    }

    for (let i = startIndex; i < testCases.length; i++) {
      const testCase = testCases[i];

      if (i + 1 < testCases.length) {
        const nextTestCase = testCases[i + 1];
        if (testCase.startTimeMillis === nextTestCase.startTimeMillis) {
          continue;
        }
      }

      if (fetchLog.timeMillis < testCase.startTimeMillis) {
        return undefined;
      }
      if (testCase.finishTimeMillis <= fetchLog.timeMillis) {
        continue;
      }

      this.currentTestIndexes.set(testFile, i);
      return testCase;
    }

    return undefined;
  }
}
