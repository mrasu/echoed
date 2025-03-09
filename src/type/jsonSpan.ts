import { SpanKind, StatusCode } from "@shared/type/echoedParam";
import { z } from "zod";

export const JsonLong = z.string();
export type JsonLong = z.infer<typeof JsonLong>;

export const JsonKeyValue = z.strictObject({
  key: z.string().optional(),
  value: z.lazy(() => jsonAnyValue.optional()),
});
export type JsonKeyValue = z.infer<typeof JsonKeyValue>;

export interface IJsonArrayValue {
  values?: JsonAnyValue[];
}
// eslint-disable-next-line prefer-const
export let JsonArrayValue: z.ZodType<IJsonArrayValue>;

export interface IJsonKeyValueList {
  values?: JsonKeyValue[] | null;
}
// eslint-disable-next-line prefer-const
export let JsonKeyValueList: z.ZodType<IJsonKeyValueList>;

export const BaseJsonAnyValue = z.strictObject({
  stringValue: z.string().optional(),
  boolValue: z.boolean().optional(),
  intValue: JsonLong.optional(),
  doubleValue: z.number().optional(),
  bytesValue: z.string().optional(),
});
export type JsonAnyValue = z.infer<typeof BaseJsonAnyValue> & {
  arrayValue?: JsonArrayValue;
  kvlistValue?: JsonKeyValueList;
};
const jsonAnyValue = BaseJsonAnyValue.extend({
  arrayValue: z.lazy(() => JsonArrayValue.optional()),
  kvlistValue: z.lazy(() => JsonKeyValueList.optional()),
});

JsonArrayValue = z.strictObject({
  values: z.array(jsonAnyValue).optional(),
});
export type JsonArrayValue = z.infer<typeof JsonArrayValue>;

JsonKeyValueList = z.strictObject({
  values: z.array(JsonKeyValue).nullish(),
});
export type JsonKeyValueList = z.infer<typeof JsonKeyValueList>;

export const JsonEvent = z.strictObject({
  timeUnixNano: JsonLong.nullish(),
  name: z.string().nullish(),
  attributes: z.array(JsonKeyValue).nullish(),
  droppedAttributesCount: z.number().nullish(),
});
export type JsonEvent = z.infer<typeof JsonEvent>;

export const JsonLink = z.strictObject({
  traceId: z.string().nullish(),
  spanId: z.string().nullish(),
  traceState: z.string().nullish(),
  attributes: z.array(JsonKeyValue).nullish(),
  droppedAttributesCount: z.number().nullish(),
});
export type JsonLink = z.infer<typeof JsonLink>;

export const JsonStatus = z.strictObject({
  message: z.string().nullish(),
  code: z.enum(StatusCode).nullish(),
});
export type JsonStatus = z.infer<typeof JsonStatus>;

export const JsonResource = z.strictObject({
  attributes: z.array(JsonKeyValue).nullish(),
  droppedAttributesCount: z.number().nullish(),
});
export type JsonResource = z.infer<typeof JsonResource>;

export const JsonInstrumentationScope = z.strictObject({
  name: z.string().nullish(),
  version: z.string().nullish(),
  attributes: z.array(JsonKeyValue).nullish(),
  droppedAttributesCount: z.number().nullish(),
});
export type JsonInstrumentationScope = z.infer<typeof JsonInstrumentationScope>;

// use `z.object` instead of `z.strictObject` as opentelemetry-proto varies.
export const JsonSpan = z.object({
  attributes: z.array(JsonKeyValue).optional(),
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string(),
  name: z.string().optional(),
  startTimeUnixNano: JsonLong.optional(),
  endTimeUnixNano: JsonLong.optional(),
  events: z.array(JsonEvent).optional(),
  links: z.array(JsonLink).optional(),
  kind: z.enum(SpanKind).optional(),
  status: JsonStatus.optional(),
  resource: JsonResource.optional(),
  scope: JsonInstrumentationScope.optional(),
});
export type JsonSpan = z.infer<typeof JsonSpan>;
