import { Base64String } from "@/type/base64String";

export class TraceHistory {
  private traces: [string, Base64String][] = [];

  push(key: string, traceId: Base64String): void {
    this.traces.push([key, traceId]);
  }

  get copiedTraces(): [string, Base64String][] {
    return this.traces.map((v) => [v[0], v[1]]);
  }

  getLastTraceId(pattern: string | RegExp): Base64String | undefined {
    const trace = this.traces.reverse().find(([key]) => {
      if (pattern instanceof RegExp) {
        return pattern.test(key);
      }
      return key === pattern;
    });

    return trace?.[1];
  }
}
