import { opentelemetry } from "@/generated/otelpbj";
import { Logger } from "@/logger";
import { OtelLogStore } from "@/server/store/otelLogStore";
import { OtelSpanStore } from "@/server/store/otelSpanStore";
import { WaitForSpanRequestStore } from "@/server/store/waitForSpanRequestStore";
import { OtelLogRecord } from "@/type/otelLogRecord";
import { OtelSpan } from "@/type/otelSpan";
import { toHex } from "@/util/byte";
import LogsData = opentelemetry.proto.logs.v1.LogsData;
import TracesData = opentelemetry.proto.trace.v1.TracesData;

export class OtelService {
  constructor(
    private otelSpanStore: OtelSpanStore,
    private otelLogStore: OtelLogStore,
    private waitForSpanRequests: WaitForSpanRequestStore,
  ) {}

  async handleOtelTraces(tracesData: TracesData): Promise<void> {
    const otelSpans: OtelSpan[] = [];
    tracesData.resourceSpans.forEach((resourceSpan) => {
      resourceSpan.scopeSpans?.forEach((scopeSpan) => {
        scopeSpan.spans?.forEach((span) => {
          const resource =
            resourceSpan.resource as opentelemetry.proto.resource.v1.Resource;
          const scope =
            scopeSpan.scope as opentelemetry.proto.common.v1.InstrumentationScope;
          const otelSpan = new OtelSpan(span, resource, scope);
          otelSpans.push(otelSpan);
        });
      });
    });

    for (const otelSpan of otelSpans) {
      await this.captureSpan(otelSpan);
    }
  }

  private async captureSpan(span: OtelSpan): Promise<void> {
    this.debugLogSpan(span);

    const traceId = toHex(span.traceId).hexString;

    await this.otelSpanStore.capture(span);

    await this.waitForSpanRequests.update(traceId, (requests) => {
      const notMatchRequests = requests.filter((request) => {
        if (request.matches(span)) {
          void request.respond(span);
          return false;
        } else {
          return true;
        }
      });
      return notMatchRequests;
    });
  }

  private debugLogSpan(span: OtelSpan): void {
    Logger.debug("Trace", "JSON", JSON.stringify(span));
  }

  async handleOtelLogs(logsData: LogsData): Promise<void> {
    const otelLogs: OtelLogRecord[] = [];
    logsData.resourceLogs.forEach((resourceLog) => {
      resourceLog.scopeLogs?.forEach((scopeLog) => {
        scopeLog.logRecords?.forEach((log) => {
          const otelLogRecord = new OtelLogRecord(log);
          otelLogs.push(otelLogRecord);
        });
      });
    });

    for (const otelLogRecord of otelLogs) {
      await this.captureLog(otelLogRecord);
    }
  }

  private async captureLog(log: OtelLogRecord): Promise<void> {
    this.debugLogLogRecord(log);

    await this.otelLogStore.capture(log);
  }

  private debugLogLogRecord(log: OtelLogRecord): void {
    Logger.debug("Log", "JSON", JSON.stringify(log));
  }
}
