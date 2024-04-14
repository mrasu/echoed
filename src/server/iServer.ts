import { OtelLogRecord } from "@/type/otelLogRecord";
import { OtelSpan } from "@/type/otelSpan";
import { TestCase } from "@/type/testCase";

export interface IServer {
  stopAfter(waitSec: number): Promise<{
    capturedSpans: Map<string, OtelSpan[]>;
    capturedLogs: Map<string, OtelLogRecord[]>;
    capturedTestCases: Map<string, TestCase[]>;
  }>;
}
