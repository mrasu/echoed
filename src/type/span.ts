import {
  JsonAnyValue,
  JsonArrayValue,
  JsonEvent,
  JsonInstrumentationScope,
  JsonKeyValue,
  JsonKeyValueList,
  JsonLink,
  JsonResource,
  JsonSpan,
  JsonStatus,
} from "@/type/jsonSpan";
import { decodeBase64 } from "@/util/byte";
import { SpanKind, StatusCode } from "@shared/type/echoedParam";
import Long from "long";

export class Span {
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

  constructor(span: JsonSpan) {
    this.attributes = span.attributes?.map((kv) => new KeyValue(kv)) || [];
    this.traceId = decodeBase64(span.traceId);
    this.spanId = decodeBase64(span.spanId);
    this.parentSpanId = decodeBase64(span.parentSpanId);
    this.name = span.name || "[unknown]";
    this.startTimeUnixNano = span.startTimeUnixNano
      ? Long.fromString(span.startTimeUnixNano)
      : undefined;
    this.endTimeUnixNano = span.endTimeUnixNano
      ? Long.fromString(span.endTimeUnixNano)
      : undefined;
    this.events = span.events?.map((event) => new Event(event)) || [];
    this.links = span.links?.map((link) => new Link(link)) || [];
    this.kind = span.kind;
    this.status = span.status ? new Status(span.status) : undefined;
    this.resource = span.resource ? new Resource(span.resource) : undefined;
    this.scope = span.scope ? new InstrumentationScope(span.scope) : undefined;
  }
}

export class Event {
  timeUnixNano?: Long;
  name?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;

  constructor(event: JsonEvent) {
    this.timeUnixNano = event.timeUnixNano
      ? Long.fromString(event.timeUnixNano)
      : undefined;
    this.name = event.name ?? undefined;
    this.attributes = event.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = event.droppedAttributesCount ?? undefined;
  }
}

export class Link {
  traceId?: Uint8Array;
  spanId?: Uint8Array;
  traceState?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;

  constructor(link: JsonLink) {
    this.traceId = link.traceId ? decodeBase64(link.traceId) : undefined;
    this.spanId = link.spanId ? decodeBase64(link.spanId) : undefined;
    this.traceState = link.traceState ?? undefined;
    this.attributes = link.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = link.droppedAttributesCount ?? undefined;
  }
}

export class Status {
  message?: string;
  code?: StatusCode;

  constructor(status: JsonStatus) {
    this.message = status.message ?? undefined;
    this.code = status.code ?? undefined;
  }
}

export class Resource {
  attributes?: KeyValue[];
  droppedAttributesCount?: number;

  constructor(status: JsonResource) {
    this.attributes = status.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = status.droppedAttributesCount ?? undefined;
  }
}

export class InstrumentationScope {
  name?: string;
  version?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;

  constructor(status: JsonInstrumentationScope) {
    this.name = status.name ?? undefined;
    this.version = status.version ?? undefined;
    this.attributes = status.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = status.droppedAttributesCount ?? undefined;
  }
}

export class KeyValue {
  key?: string;
  value?: AnyValue;

  constructor(kv: JsonKeyValue) {
    this.key = kv.key ?? undefined;
    this.value = kv.value ? new AnyValue(kv.value) : undefined;
  }
}

export class AnyValue {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: number;
  doubleValue?: number;
  bytesValue?: Uint8Array;
  arrayValue?: ArrayValue;
  kvlistValue?: KeyValueList;

  constructor(value: JsonAnyValue) {
    this.stringValue = value.stringValue ?? undefined;
    this.boolValue = value.boolValue ?? undefined;
    this.intValue = value.intValue
      ? Long.fromString(value.intValue).toNumber()
      : undefined;
    this.doubleValue = value.doubleValue ?? undefined;
    this.bytesValue = value.bytesValue
      ? decodeBase64(value.bytesValue)
      : undefined;
    this.arrayValue = value.arrayValue
      ? new ArrayValue(value.arrayValue)
      : undefined;
    this.kvlistValue = value.kvlistValue
      ? new KeyValueList(value.kvlistValue)
      : undefined;
  }
}

export class ArrayValue {
  values?: AnyValue[];

  constructor(value: JsonArrayValue) {
    this.values = value.values?.map((v: JsonAnyValue) => new AnyValue(v));
  }
}

export class KeyValueList {
  values?: KeyValue[];

  constructor(value: JsonKeyValueList) {
    this.values = value.values?.map((v: JsonKeyValue) => new KeyValue(v));
  }
}
