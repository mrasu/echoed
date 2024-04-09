import { ErrorMessage } from "@/type/common";
import { JsonSpan } from "@/type/jsonSpan";
import { Span } from "@/type/span";
import {
  JsonSpanFilterOption,
  restoreSpanFilterOption,
  SpanFilterOption,
} from "@/type/spanFilterOption";
import { z } from "zod";

export type WaitForSpanEventRequestParam = {
  base64TraceId: string;
  filter: SpanFilterOption;
  waitTimeoutMs: number;
};

export const JsonWaitForSpanEventRequestParam = z.strictObject({
  base64TraceId: z.string(),
  filter: JsonSpanFilterOption,
  waitTimeoutMs: z.number(),
});

export type JsonWaitForSpanEventRequestParam = z.infer<
  typeof JsonWaitForSpanEventRequestParam
>;

export type WaitForSpanEventResponse =
  | {
      span: Span;
    }
  | ErrorMessage;

export const JsonWaitForSpanEventResponse = z.union([
  z.strictObject({
    span: JsonSpan,
  }),
  ErrorMessage,
]);
export type JsonWaitForSpanEventResponse = z.infer<
  typeof JsonWaitForSpanEventResponse
>;

export function restoreWaitForSpanEventRequestParam(
  param: JsonWaitForSpanEventRequestParam,
): WaitForSpanEventRequestParam {
  return {
    base64TraceId: param.base64TraceId,
    filter: restoreSpanFilterOption(param.filter),
    waitTimeoutMs: param.waitTimeoutMs,
  };
}

export function restoreWaitForSpanEventResponse(
  data: JsonWaitForSpanEventResponse,
): WaitForSpanEventResponse {
  if ("error" in data) {
    return data;
  }
  return { span: new Span(data.span) };
}
