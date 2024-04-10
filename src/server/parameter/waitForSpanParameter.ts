import { Base64String } from "@/type/base64String";
import { ErrorMessage } from "@/type/common";
import { JsonSpan } from "@/type/jsonSpan";
import { Span } from "@/type/span";
import {
  JsonSpanFilterOption,
  restoreSpanFilterOption,
  SpanFilterOption,
} from "@/type/spanFilterOption";
import { z } from "zod";

export type WaitForSpanEventRequestObjectParam = {
  base64TraceId: string;
  filter: SpanFilterOption;
  waitTimeoutMs: number;
};

export const WaitForSpanEventRequestParam = z.strictObject({
  base64TraceId: z.string(),
  filter: JsonSpanFilterOption,
  waitTimeoutMs: z.number(),
});

export type WaitForSpanEventRequestParam = z.infer<
  typeof WaitForSpanEventRequestParam
>;

export type RestoredWaitForSpanEventRequestParam = {
  traceId: Base64String;
  filter: SpanFilterOption;
  waitTimeoutMs: number;
};

export function restoreWaitForSpanEventRequestParam(
  data: WaitForSpanEventRequestParam,
): RestoredWaitForSpanEventRequestParam {
  return {
    traceId: new Base64String(data.base64TraceId),
    filter: restoreSpanFilterOption(data.filter),
    waitTimeoutMs: data.waitTimeoutMs,
  };
}

export const WaitForSpanEventResponse = z.union([
  z.strictObject({
    span: JsonSpan,
  }),
  ErrorMessage,
]);

export type WaitForSpanEventResponse = z.infer<typeof WaitForSpanEventResponse>;

export type RestoredWaitForSpanEventResponse =
  | {
      span: Span;
    }
  | ErrorMessage;

export function restoreWaitForSpanEventResponse(
  data: WaitForSpanEventResponse,
): RestoredWaitForSpanEventResponse {
  if ("error" in data) {
    return data;
  }
  return { span: new Span(data.span) };
}
