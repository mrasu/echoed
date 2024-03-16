import { convertSpanFilterOption } from "@/command/bridge/compare";
import { SpanFilterOption, WaitOption } from "@/command/span";
import { Span } from "@/command/spanType";
import { WantSpanEventRequestParam } from "@/server/parameter";
import { requestWantSpanEvent } from "@/server/request";
import { Base64String } from "@/type/base64String";

const DEFAULT_TIMEOUT_MS = 10_000;

export async function waitForSpanForTraceId(
  port: number,
  traceId: Base64String,
  filter: SpanFilterOption,
  options?: WaitOption,
): Promise<Span> {
  const request: WantSpanEventRequestParam = {
    base64TraceId: traceId.base64String,
    filter: convertSpanFilterOption(filter),
    waitTimeoutMs: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };

  return await requestWantSpanEvent(port, request);
}
