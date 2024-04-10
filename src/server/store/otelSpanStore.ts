import { OtelSpan } from "@/type/otelSpan";
import { toBase64 } from "@/util/byte";
import { Mutex } from "async-mutex";

export class OtelSpanStore {
  capturedSpans: Map<string, OtelSpan[]> = new Map();

  constructor(private spanMutex: Mutex) {}

  async capture(span: OtelSpan): Promise<void> {
    const traceId = toBase64(span.traceId).base64String;
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
