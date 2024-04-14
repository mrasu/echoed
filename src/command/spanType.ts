import { SpanKind, StatusCode } from "@shared/type/echoedParam";
import Long from "long";

export type Span = {
  attributes: KeyValue[];
  traceId: Uint8Array;
  spanId: Uint8Array;
  parentSpanId: Uint8Array;
  name: string;
  startTimeUnixNano?: Long;
  endTimeUnixNano?: Long;
  events?: Event[];
  links?: Link[];
  kind?: SpanKind;
  status?: Status;
  resource?: Resource;
  scope?: InstrumentationScope;
};

export type Event = {
  timeUnixNano?: Long;
  name?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
};

export type Link = {
  traceId?: Uint8Array;
  spanId?: Uint8Array;
  traceState?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
};

export type Status = {
  message?: string;
  code?: StatusCode;
};

export type Resource = {
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
};

export type InstrumentationScope = {
  name?: string;
  version?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
};

export type KeyValue = {
  key?: string;
  value?: AnyValue;
};

export type AnyValue = {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: number;
  doubleValue?: number;
  bytesValue?: Uint8Array;
  arrayValue?: ArrayValue;
  kvlistValue?: KeyValueList;
};

export type ArrayValue = {
  values?: AnyValue[];
};

export type KeyValueList = {
  values?: KeyValue[];
};
