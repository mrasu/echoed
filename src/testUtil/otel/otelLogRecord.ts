import { opentelemetry } from "@/generated/otelpbj";
import { OtelLogRecord } from "@/type/otelLogRecord";
import ILogRecord = opentelemetry.proto.logs.v1.ILogRecord;

const DEFAULT_TRACE_ID = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
const DEFAULT_LOG: ILogRecord = {
  traceId: DEFAULT_TRACE_ID,
  body: {
    stringValue: "test log",
  },
};

export function buildOtelLogRecord(
  log: Partial<ILogRecord> = {},
): OtelLogRecord {
  return new OtelLogRecord({
    ...DEFAULT_LOG,
    ...log,
  });
}
