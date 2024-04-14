import { ErrorMessage } from "@/type/common";
import { HexString } from "@/type/hexString";
import { JsonSpan } from "@/type/jsonSpan";
import { Span } from "@/type/span";
import {
  JsonSpanFilterOption,
  restoreSpanFilterOption,
  SpanFilterOption,
} from "@/type/spanFilterOption";
import { z } from "zod";

export type WaitForSpanEventRequestObjectParam = {
  hexTraceId: string;
  filter: SpanFilterOption;
  waitTimeoutMs: number;
};

export const WaitForSpanEventRequestParam = z.strictObject({
  hexTraceId: z.string(),
  filter: JsonSpanFilterOption,
  waitTimeoutMs: z.number(),
});

export type WaitForSpanEventRequestParam = z.infer<
  typeof WaitForSpanEventRequestParam
>;

export type RestoredWaitForSpanEventRequestParam = {
  traceId: HexString;
  filter: SpanFilterOption;
  waitTimeoutMs: number;
};

export function restoreWaitForSpanEventRequestParam(
  data: WaitForSpanEventRequestParam,
): RestoredWaitForSpanEventRequestParam {
  return {
    traceId: new HexString(data.hexTraceId),
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
