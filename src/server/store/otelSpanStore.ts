import { OtelSpan } from "@/type/otelSpan";
import { toHex } from "@/util/byte";
import { Mutex } from "async-mutex";

export class OtelSpanStore {
  capturedSpans: Map<string, OtelSpan[]> = new Map();

  constructor(private spanMutex: Mutex) {}

  async capture(span: OtelSpan): Promise<void> {
    const traceId = toHex(span.traceId).hexString;
    await this.spanMutex.runExclusive(() => {
      if (!this.capturedSpans.has(traceId)) {
        this.capturedSpans.set(traceId, []);
      }
      this.capturedSpans.get(traceId)?.push(span);
    });
  }

  getCaptured(traceId: string): OtelSpan[] | undefined {
    return this.capturedSpans.get(traceId);
  }
}
