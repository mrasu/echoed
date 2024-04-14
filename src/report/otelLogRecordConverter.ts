import { convertAnyValue } from "@/report/otelAnyValueConverter";
import { OtelLogRecord } from "@/type/otelLogRecord";
import { toHexString } from "@/util/byte";
import { ILogRecord } from "@shared/type/echoedParam";

export class OtelLogRecordConverter {
  static convertAll(logRecords: OtelLogRecord[]): ILogRecord[] {
    return logRecords.map((logRecord) =>
      new OtelLogRecordConverter().convert(logRecord),
    );
  }

  convert(logRecord: OtelLogRecord): ILogRecord {
    return {
      timeUnixNano: logRecord.timeUnixNano?.toString(),
      traceId: toHexString(logRecord.traceId),
      spanId: toHexString(logRecord.spanId),
      body: logRecord.body ? convertAnyValue(logRecord.body) : undefined,
    };
  }
}
