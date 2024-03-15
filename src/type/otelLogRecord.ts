import { opentelemetry } from "@/generated/otelpbj";
import LogRecord = opentelemetry.proto.logs.v1.LogRecord;

export class OtelLogRecord extends LogRecord {
  static fromJsonLogs(
    logRecords: opentelemetry.proto.logs.v1.ILogRecord[],
  ): OtelLogRecord[] {
    return logRecords.map((log) => LogRecord.fromObject(log));
  }

  constructor(logRecord: opentelemetry.proto.logs.v1.ILogRecord) {
    super(logRecord);
  }
}
