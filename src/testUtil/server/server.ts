import { IServer } from "@/server/iServer";
import { OtelLogRecord } from "@/type/otelLogRecord";
import { OtelSpan } from "@/type/otelSpan";
import { TestCase } from "@/type/testCase";

export class DummyServer implements IServer {
  capturedSpans: Map<string, OtelSpan[]>;
  capturedLogs: Map<string, OtelLogRecord[]>;
  capturedTestCases: Map<string, TestCase[]>;

  constructor({
    capturedLogs,
    capturedSpans,
    capturedTestCases,
  }: {
    capturedSpans?: Map<string, OtelSpan[]>;
    capturedLogs?: Map<string, OtelLogRecord[]>;
    capturedTestCases?: Map<string, TestCase[]>;
  } = {}) {
    this.capturedSpans = capturedSpans ?? new Map<string, OtelSpan[]>();
    this.capturedLogs = capturedLogs ?? new Map<string, OtelLogRecord[]>();
    this.capturedTestCases = capturedTestCases ?? new Map<string, TestCase[]>();
  }

  stopAfter(_waitSec: number): Promise<{
    capturedSpans: Map<string, OtelSpan[]>;
    capturedLogs: Map<string, OtelLogRecord[]>;
    capturedTestCases: Map<string, TestCase[]>;
  }> {
    const a = {
      capturedSpans: this.capturedSpans,
      capturedLogs: this.capturedLogs,
      capturedTestCases: this.capturedTestCases,
    };
    return Promise.resolve(a);
  }
}
