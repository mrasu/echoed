import { opentelemetry } from "@/generated/otelpbj";

export class OtelLogRecord extends opentelemetry.proto.logs.v1.LogRecord {
  constructor(logRecord: opentelemetry.proto.logs.v1.ILogRecord) {
    super(logRecord);
  }
}
