import { ErrorMessage } from "@/type/common";
import { jsonSpan } from "@/type/jsonSpan";
import { Span } from "@/type/span";
import {
  jsonSpanFilterOption,
  restoreSpanFilterOption,
  SpanFilterOption,
} from "@/type/spanFilterOption";

export type WantSpanEventRequestParam = {
  base64TraceId: string;
  filter: SpanFilterOption;
  waitTimeoutMs: number;
};

type jsonWantSpanEventRequestParam = {
  base64TraceId: string;
  filter: jsonSpanFilterOption;
  waitTimeoutMs: number;
};

export type WantSpanEventResponse =
  | {
      span: Span;
    }
  | ErrorMessage;

export type jsonWantSpanEventResponse =
  | {
      span: jsonSpan;
    }
  | ErrorMessage;

export function restoreWantSpanEventRequestParam(
  json: unknown,
): WantSpanEventRequestParam {
  const data = json as jsonWantSpanEventRequestParam;

  return {
    base64TraceId: data.base64TraceId,
    filter: restoreSpanFilterOption(data.filter),
    waitTimeoutMs: data.waitTimeoutMs,
  };
}

export function restoreWantSpanEventResponse(
  json: unknown,
): WantSpanEventResponse {
  const data = json as jsonWantSpanEventResponse;

  if ("error" in data) {
    return data;
  }
  return { span: new Span(data.span) };
}
