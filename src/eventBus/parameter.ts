import { JsonSpan } from "@/type/jsonSpan";
import { OtelSpan } from "@/type/otelSpan";
import {
  JsonSpanFilterOption,
  restoreSpanFilterOption,
  SpanFilterOption,
} from "@/type/spanFilterOption";
import { z } from "zod";

export type WaitForSpanEvent = {
  base64TraceId: string;
  filter: SpanFilterOption;
  wantId: string;
};

type ReceiveSpanEvent = {
  wantId: string;
  base64TraceId: string;
  span: JsonSpan;
};

// Span of ReceiveSpanEvent can be OtelSpan because OtelSpan becomes ISpan after JSON.parse(JSON.stringify)
export type ReceiveSpanEmitEvent = Omit<ReceiveSpanEvent, "span"> & {
  span: JsonSpan | OtelSpan;
};

export const JsonWaitForSpanEvent = z.strictObject({
  base64TraceId: z.string(),
  filter: JsonSpanFilterOption,
  wantId: z.string(),
});
export type JsonWaitForSpanEvent = z.infer<typeof JsonWaitForSpanEvent>;

export const JsonReceiveSpanEvent = z.strictObject({
  wantId: z.string(),
  base64TraceId: z.string(),
  span: JsonSpan,
});
export type JsonReceiveSpanEvent = z.infer<typeof JsonReceiveSpanEvent>;

export function restoreWaitForSpanEvent(
  data: JsonWaitForSpanEvent,
): WaitForSpanEvent {
  return {
    base64TraceId: data.base64TraceId,
    filter: restoreSpanFilterOption(data.filter),
    wantId: data.wantId,
  };
}

export function restoreReceiveSpanEvent(
  data: JsonReceiveSpanEvent,
): ReceiveSpanEvent {
  return {
    wantId: data.wantId,
    base64TraceId: data.base64TraceId,
    span: data.span,
  };
}
