import { convertSpanFilterOption } from "@/command/bridge/compare";
import { SpanFilterOption, WaitOption } from "@/command/span";
import { Span } from "@/command/spanType";
import { requestWaitForSpanEvent } from "@/server/request";
import { FetchRequester } from "@/server/requester/fetchRequester";
import { Requester } from "@/server/requester/requester";
import { Base64String } from "@/type/base64String";

const DEFAULT_TIMEOUT_MS = 10_000;

export type FulfilledWaitOption = {
  timeoutMs: number;
};

export function fulfillWaitOption(options?: WaitOption): FulfilledWaitOption {
  return {
    timeoutMs: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
}

export async function waitForSpanForTraceId(
  port: number,
  traceId: Base64String,
  filter: SpanFilterOption,
  options: FulfilledWaitOption,
): Promise<Span> {
  const requester = new FetchRequester();
  return await waitForSpanForTraceIdWithRequester(
    requester,
    port,
    traceId,
    filter,
    options,
  );
}

export async function waitForSpanForTraceIdWithRequester(
  requester: Requester,
  port: number,
  traceId: Base64String,
  filter: SpanFilterOption,
  options: FulfilledWaitOption,
): Promise<Span> {
  const param = {
    base64TraceId: traceId.base64String,
    filter: convertSpanFilterOption(filter),
    waitTimeoutMs: options.timeoutMs,
  };

  return await requestWaitForSpanEvent(requester, port, param);
}
