import { jsonSpan } from "@/type/jsonSpan";
import { OtelSpan } from "@/type/otelSpan";
import {
  jsonSpanFilterOption,
  restoreSpanFilterOption,
  SpanFilterOption,
} from "@/type/spanFilterOption";

export type WantSpanEvent = {
  base64TraceId: string;
  filter: SpanFilterOption;
  wantId: string;
};

type ReceiveSpanEvent = {
  wantId: string;
  base64TraceId: string;
  span: jsonSpan;
};

// Span of ReceiveSpanEvent can be OtelSpan because OtelSpan becomes ISpan after JSON.parse(JSON.stringify)
export type ReceiveSpanEmitEvent = Omit<ReceiveSpanEvent, "span"> & {
  span: jsonSpan | OtelSpan;
};

export type jsonWantSpanEvent = {
  base64TraceId: string;
  filter: jsonSpanFilterOption;
  wantId: string;
};

export type jsonReceiveSpanEvent = {
  wantId: string;
  base64TraceId: string;
  span: jsonSpan;
};

export function restoreWantSpanEvent(data: jsonWantSpanEvent): WantSpanEvent {
  return {
    base64TraceId: data.base64TraceId,
    filter: restoreSpanFilterOption(data.filter),
    wantId: data.wantId,
  };
}

export function restoreReceiveSpanEvent(
  data: jsonReceiveSpanEvent,
): ReceiveSpanEvent {
  return {
    wantId: data.wantId,
    base64TraceId: data.base64TraceId,
    span: data.span,
  };
}
