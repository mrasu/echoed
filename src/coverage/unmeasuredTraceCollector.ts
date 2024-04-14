import { OtelSpan } from "@/type/otelSpan";
import { toHex } from "@/util/byte";

export class UnmeasuredTraceCollector {
  private readonly traceIds = new Set<string>();

  addSpans(spans: OtelSpan[]): void {
    for (const span of spans) {
      if (!span.traceId) continue;
      this.traceIds.add(toHex(span.traceId).hexString);
    }
  }

  get traceIdArray(): string[] {
    return Array.from(this.traceIds);
  }
}
