import { ProtoIgnoreMethodConfig } from "@/config/config";
import { RpcMethodTraces } from "@/coverage/coverageResult";
import { OtelSpan } from "@/type/otelSpan";
import { toBase64 } from "@/util/byte";
import { TwoKeyValuesMap } from "@/util/twoKeyValuesMap";

export class SpanCollector {
  // operations are TwoKeyValuesMap<service, method, OtelSpan[]>
  private operations = new TwoKeyValuesMap<string, string, OtelSpan[]>();

  constructor(private ignorePatterns: ProtoIgnoreMethodConfig[]) {}

  add(service: string, method: string, spans: OtelSpan[]): void {
    if (this.isIgnored(service, method)) return;

    this.operations.initOr(service, method, spans, (v) => {
      v.push(...spans);
    });
  }

  private isIgnored(service: string, method: string): boolean {
    for (const { service: s, method: m } of this.ignorePatterns) {
      if (!s.matchString(service)) continue;
      if (!m.matchString(method)) continue;

      return true;
    }

    return false;
  }

  toRpcMethodTraces(): RpcMethodTraces[] {
    return this.operations.entries().map(([service, method, spans]) => {
      const traceIds = spans
        .filter((span) => span.traceId)
        .map((span) => toBase64(span.traceId));

      return {
        service,
        method,
        traceIds: traceIds,
      };
    });
  }
}
