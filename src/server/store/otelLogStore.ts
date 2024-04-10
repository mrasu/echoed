import { OtelLogRecord } from "@/type/otelLogRecord";
import { toBase64 } from "@/util/byte";
import { Mutex } from "async-mutex";

export class OtelLogStore {
  capturedLogs: Map<string, OtelLogRecord[]> = new Map();

  private mutex = new Mutex();

  constructor() {}

  async capture(log: OtelLogRecord): Promise<void> {
    const traceId = toBase64(log.traceId).base64String;

    await this.mutex.runExclusive(() => {
      if (!this.capturedLogs.has(traceId)) {
        this.capturedLogs.set(traceId, []);
      }
      this.capturedLogs.get(traceId)?.push(log);
    });
  }
}
