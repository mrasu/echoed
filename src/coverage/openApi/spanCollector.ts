import { OpenApiIgnoreOperationConfig } from "@/config/config";
import { HttpOperationTraces } from "@/coverage/coverageResult";
import { Method } from "@/type/http";
import { OtelSpan } from "@/type/otelSpan";
import { toBase64 } from "@/util/byte";
import { TwoKeyValuesMap } from "@/util/twoKeyValuesMap";

export class SpanCollector {
  // operations are TwoKeyValuesMap<path, Method, OtelSpan[]>
  private operations = new TwoKeyValuesMap<string, Method, OtelSpan[]>();

  constructor(private ignorePatterns: OpenApiIgnoreOperationConfig[]) {}

  add(path: string, method: Method, spans: OtelSpan[]): void {
    if (this.isIgnored(path, method)) return;

    this.operations.initOr(path, method, spans, (v) => {
      v.push(...spans);
    });
  }

  private isIgnored(path: string, method: Method): boolean {
    for (const { path: p, method: m } of this.ignorePatterns) {
      if (method !== m) continue;
      if (!p.matchString(path)) continue;

      return true;
    }

    return false;
  }

  toHttpOperationTraces(): HttpOperationTraces[] {
    return this.operations.entries().map(([path, method, spans]) => {
      const traceIds = spans
        .filter((span) => span.traceId)
        .map((span) => toBase64(span.traceId));

      return {
        path,
        method,
        traceIds: traceIds,
      };
    });
  }
}
