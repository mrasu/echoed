import { ErrorMessage } from "@/type/common";
import { JsonSpan } from "@/type/jsonSpan";
import { Span } from "@/type/span";
import {
  JsonSpanFilterOption,
  restoreSpanFilterOption,
  SpanFilterOption,
} from "@/type/spanFilterOption";
import { z } from "zod";

export type WantSpanEventRequestParam = {
  base64TraceId: string;
  filter: SpanFilterOption;
  waitTimeoutMs: number;
};

export const JsonWantSpanEventRequestParam = z.strictObject({
  base64TraceId: z.string(),
  filter: JsonSpanFilterOption,
  waitTimeoutMs: z.number(),
});

export type JsonWantSpanEventRequestParam = z.infer<
  typeof JsonWantSpanEventRequestParam
>;

export type WantSpanEventResponse =
  | {
      span: Span;
    }
  | ErrorMessage;

export const JsonWantSpanEventResponse = z.union([
  z.strictObject({
    span: JsonSpan,
  }),
  ErrorMessage,
]);
export type JsonWantSpanEventResponse = z.infer<
  typeof JsonWantSpanEventResponse
>;

export function restoreWantSpanEventRequestParam(
  param: JsonWantSpanEventRequestParam,
): WantSpanEventRequestParam {
  return {
    base64TraceId: param.base64TraceId,
    filter: restoreSpanFilterOption(param.filter),
    waitTimeoutMs: param.waitTimeoutMs,
  };
}

export function restoreWantSpanEventResponse(
  data: JsonWantSpanEventResponse,
): WantSpanEventResponse {
  if ("error" in data) {
    return data;
  }
  return { span: new Span(data.span) };
}
