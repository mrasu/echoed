import { HexString } from "@/type/hexString";

export class TraceHistory {
  private traces: [string, HexString][] = [];

  push(key: string, traceId: HexString): void {
    this.traces.push([key, traceId]);
  }

  get copiedTraces(): [string, HexString][] {
    return this.traces.map((v) => [v[0], v[1]]);
  }

  getLastTraceId(pattern: string | RegExp): HexString | undefined {
    const trace = this.traces.reverse().find(([key]) => {
      if (pattern instanceof RegExp) {
        return pattern.test(key);
      }
      return key === pattern;
    });

    return trace?.[1];
  }
}
