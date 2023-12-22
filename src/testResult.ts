import fs from "fs";
import path from "path";

import { TobikuraSpan } from "@/type/tobikuraSpan";
import {
  FetchFinishedLog,
  ITobikuraLogRecord,
  Log,
  TimeHoldingLog,
} from "@/types";
import { TestCaseResult } from "@/testCaseResult";
import { Logger } from "@/logger";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { TobikuraConfig } from "@/config/tobikuraConfig";
import { FetchInfo } from "@/fetchInfo";
import { opentelemetry } from "@/generated/otelpbj";

const SpanKind = opentelemetry.proto.trace.v1.Span.SpanKind;

const PropagationRequiredKinds = new Set([
  SpanKind.SPAN_KIND_SERVER,
  SpanKind.SPAN_KIND_CONSUMER,
]);

function isPropagationRequiredSpan(span: TobikuraSpan): boolean {
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
  allSpans: Record<string, TobikuraSpan[]>,
): Record<string, TobikuraSpan[]> {
  const propagationFailedTraceIds: Set<string> = new Set();

  for (const [traceId, spanList] of Object.entries(allSpans)) {
    for (const span of spanList) {
      if (!isPropagationRequiredSpan(span)) continue;
      if (span.shouldIgnoreFromPropagationTest(propagationTestConfig)) {
        continue;
      }

      propagationFailedTraceIds.add(traceId);
      break;
    }
  }

  const propagationFailedSpans: Record<string, TobikuraSpan[]> = {};

  for (const [traceId, spanList] of Object.entries(allSpans)) {
    if (propagationFailedTraceIds.has(traceId)) {
      propagationFailedSpans[traceId] = spanList;
    }
  }

  return propagationFailedSpans;
}

export class TestResult {
  public testCaseResults: TestCaseResult[];
  public capturedSpans: Record<string, TobikuraSpan[]>;
  public propagationFailedSpans: Record<string, TobikuraSpan[]>;
  public capturedLogs: Record<string, ITobikuraLogRecord[]>;

  static async collect(
    testRootDir: string,
    tmpLogDir: string,
    capturedSpans: Record<string, TobikuraSpan[]>,
    capturedLogs: Record<string, ITobikuraLogRecord[]>,
    config: TobikuraConfig,
  ): Promise<TestResult> {
    const collector = new TestCaseLogCollector(testRootDir, tmpLogDir);
    const testCaseLogs = await collector.collect();

    return new TestResult(testCaseLogs, capturedSpans, capturedLogs, config);
  }

  constructor(
    testCaseResults: TestCaseResult[],
    capturedSpans: Record<string, TobikuraSpan[]>,
    capturedLogs: Record<string, ITobikuraLogRecord[]>,
    config: TobikuraConfig,
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

  get propagationFailedRootSpans(): TobikuraSpan[] {
    const rootSpans: TobikuraSpan[] = [];
    for (const [_, spans] of Object.entries(this.propagationFailedSpans)) {
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
    private tmpLogDir: string,
  ) {}

  async collect(): Promise<TestCaseResult[]> {
    const logs = this.readLogs();
    const testCaseResults = this.toTestCaseResults(logs);
    return testCaseResults;
  }

  private readLogs(): Log[] {
    const logFiles = fs.readdirSync(this.tmpLogDir);

    const rawLogs = logFiles
      .map((file: string) =>
        fs.readFileSync(path.join(this.tmpLogDir, file), "utf-8").split("\n"),
      )
      .flat();

    const logs: Log[] = [];
    rawLogs.forEach((rawLog: string) => {
      let parsed: any;
      try {
        parsed = JSON.parse(rawLog);
      } catch (e) {
        return;
      }

      if (parsed.type === "testStarted") {
        logs.push({
          type: "testStarted",
          file: parsed.file,
          testFullName: parsed.testFullName,
          time: parsed.time,
          startTimeMillis: parsed.startTimeMillis,
        });
      } else if (parsed.type === "testFinished") {
        logs.push({
          type: "testFinished",
          duration: parsed.duration,
          failureDetails: parsed.failureDetails,
          failureMessages: parsed.failureMessages,
          file: parsed.file,
          status: parsed.status,
          time: parsed.time,
        });
      } else if (parsed.type === "fetchStarted") {
        logs.push({
          type: "fetchStarted",
          time: parsed.time,
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
            body: parsed.request.body || undefined,
          },
          response: {
            status: parsed.response.status,
            body: parsed.response.body || undefined,
          },
        });
      } else {
        Logger.warn("unknown log type found: ", parsed.type);
      }
    });

    return logs;
  }

  private toTestCaseResults(logs: Log[]): TestCaseResult[] {
    const timeHoldingLogs = this.extractOrderedTimeHoldingLogs(logs);
    const fetchFinishedRecord = this.extractFetchFinishedLogAsRecord(logs);

    const currentResultForFile: Record<string, TestCaseResult> = {};
    const results: TestCaseResult[] = [];
    let testId = 0;
    for (const log of timeHoldingLogs) {
      if (log.type === "testStarted") {
        const result = new TestCaseResult(
          testId.toString(),
          log.file.replace(this.testRootDir, ""),
          log.testFullName,
          log.startTimeMillis,
          "unknown",
          [],
          [],
        );
        currentResultForFile[result.file] = result;

        testId++;
      } else if (log.type === "testFinished") {
        const testFile = log.file.replace(this.testRootDir, "");
        const result = currentResultForFile[testFile];
        if (!result) {
          // No testInfo when `.test` file is empty.
          continue;
        }

        result.status = log.status;
        result.failureDetails = log.failureDetails;
        result.failureMessages = log.failureMessages;
        result.duration = log.duration;

        results.push(result);
        delete currentResultForFile[testFile];
      } else if (log.type === "fetchStarted") {
        const testFile = log.testPath.replace(this.testRootDir, "");
        const result = currentResultForFile[testFile];
        if (!result) {
          // Ignore request outside of test
          continue;
        }

        result.orderedTraceIds.push(log.traceId);
        const fetchFinishedLog = fetchFinishedRecord[log.traceId];
        if (!fetchFinishedLog) {
          Logger.error("Invalid state: requestLog not found", log);
          continue;
        }

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
        result.fetches.push(fetch);
      }
    }

    return results;
  }

  private extractOrderedTimeHoldingLogs(logs: Log[]): TimeHoldingLog[] {
    const timeHoldingLogs: TimeHoldingLog[] = [];
    for (const log of logs) {
      if (
        log.type === "fetchStarted" ||
        log.type === "testStarted" ||
        log.type === "testFinished"
      ) {
        timeHoldingLogs.push(log);
      }
    }
    timeHoldingLogs.sort((a, b) => {
      return a.time > b.time ? 1 : -1;
    });

    return timeHoldingLogs;
  }

  private extractFetchFinishedLogAsRecord(
    logs: Log[],
  ): Record<string, FetchFinishedLog> {
    const fetchRequestRecord: Record<string, FetchFinishedLog> = {};
    for (const log of logs) {
      if (log.type !== "fetchFinished") {
        continue;
      }
      fetchRequestRecord[log.traceId] = log;
    }

    return fetchRequestRecord;
  }
}
