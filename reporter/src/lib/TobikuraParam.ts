import { Buffer } from "buffer";
import type {
  ILongable,
  ITobikuraParam,
  ISpan,
  IKeyValue,
  IEvent,
  ILink,
  IStatus,
  IKeyValueList,
  IAnyValue,
  IArrayValue,
  ITestInfo,
  ILogRecord,
} from "../types/tobikura_param";
import Long from "long";

const Million = 1000 * 1000;

export class TobikuraParam {
  static convert(param: ITobikuraParam): TobikuraParam {
    const testInfos: TestInfo[] =
      param.testInfos?.map((testInfo: ITestInfo) => {
        return new TestInfo(testInfo);
      }) || [];

    return new TobikuraParam(testInfos);
  }

  constructor(public testInfos: TestInfo[]) {}

  pickTest(testId: string): TestInfo | undefined {
    return this.testInfos.find((testInfo) => testInfo.testId === testId);
  }
}

export class TestInfo {
  testId: string;
  file: string;
  name: string;
  status: string;
  orderedTraceIds: string[];
  spans: Span[];
  logRecords: LogRecord[];

  constructor(testInfo: ITestInfo) {
    this.testId = testInfo.testId;
    this.file = testInfo.file;
    this.name = testInfo.name;
    this.status = testInfo.status;
    this.orderedTraceIds = testInfo.orderedTraceIds.map((traceId) =>
      toHex(decodeBase64(traceId)),
    );
    this.spans = testInfo.spans?.map((span: ISpan) => new Span(span)) || [];
    this.logRecords =
      testInfo.logRecords?.map((log: ILogRecord) => new LogRecord(log)) || [];
  }
}

export class Span {
  attributes: KeyValue[];
  traceId: string;
  spanId: string;
  parentSpanId: string;
  name: string;
  startTimeUnixNano?: Long;
  endTimeUnixNano?: Long;
  events?: Event[];
  links?: Link[];
  kind?: string;
  status?: Status;

  constructor(span: ISpan) {
    this.attributes = span.attributes?.map((kv) => new KeyValue(kv)) || [];
    this.traceId = toHex(decodeBase64(span.traceId));
    this.spanId = toHex(decodeBase64(span.spanId));
    this.parentSpanId = toHex(decodeBase64(span.parentSpanId));
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
  }

  get startTimeMillis(): number {
    return this.startTimeUnixNano
      ? this.startTimeUnixNano.toNumber() / Million
      : 0;
  }

  get endTimeMillis(): number {
    return this.endTimeUnixNano ? this.endTimeUnixNano.toNumber() / Million : 0;
  }
}

export class Event {
  timeUnixNano?: Long;
  name?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;

  constructor(event: IEvent) {
    this.timeUnixNano = event.timeUnixNano
      ? Long.fromString(event.timeUnixNano)
      : undefined;
    this.name = event.name || undefined;
    this.attributes = event.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = event.droppedAttributesCount || undefined;
  }
}

export class Link {
  traceId?: string;
  spanId?: string;
  traceState?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;

  constructor(link: ILink) {
    this.traceId = link.traceId ? toHex(decodeBase64(link.traceId)) : undefined;
    this.spanId = link.spanId ? toHex(decodeBase64(link.spanId)) : undefined;
    this.traceState = link.traceState || undefined;
    this.attributes = link.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = link.droppedAttributesCount || undefined;
  }
}

export class Status {
  message?: string;
  code?: number;

  constructor(status: IStatus) {
    this.message = status.message || undefined;
    this.code = status.code || undefined;
  }
}

export class LogRecord {
  traceId?: string;
  spanId?: string;
  timeUnixNano?: Long;
  observedTimeUnixNano?: Long;
  severityNumber?: string;
  severityText?: string;
  body?: AnyValue;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
  flags?: number;

  constructor(logRecord: ILogRecord) {
    this.traceId = logRecord.traceId
      ? toHex(decodeBase64(logRecord.traceId))
      : undefined;
    this.spanId = logRecord.spanId
      ? toHex(decodeBase64(logRecord.spanId))
      : undefined;
    this.timeUnixNano = logRecord.timeUnixNano
      ? Long.fromString(logRecord.timeUnixNano)
      : undefined;
    this.observedTimeUnixNano = logRecord.observedTimeUnixNano
      ? Long.fromString(logRecord.observedTimeUnixNano)
      : undefined;
    this.severityNumber = logRecord.severityNumber || undefined;
    this.severityText = logRecord.severityText || undefined;
    this.body = logRecord.body ? new AnyValue(logRecord.body) : undefined;
    this.attributes = logRecord.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = logRecord.droppedAttributesCount || undefined;
    this.flags = logRecord.flags || undefined;
  }
}

export class KeyValue {
  key?: string;
  value?: AnyValue;

  constructor(kv: IKeyValue) {
    this.key = kv.key || undefined;
    this.value = kv.value ? new AnyValue(kv.value) : undefined;
  }
}

export class AnyValue {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: ILongable;
  doubleValue?: number;
  bytesValue?: Uint8Array;
  arrayValue?: ArrayValue;
  kvlistValue?: KeyValueList;

  constructor(value: IAnyValue) {
    this.stringValue = value.stringValue || undefined;
    this.boolValue = value.boolValue || undefined;
    this.intValue = value.intValue || undefined;
    this.doubleValue = value.doubleValue || undefined;
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

  constructor(value: IArrayValue) {
    this.values = value.values?.map((v: IAnyValue) => new AnyValue(v));
  }
}

export class KeyValueList {
  values?: KeyValue[];

  constructor(value: IKeyValueList) {
    this.values = value.values?.map((v: IKeyValue) => new KeyValue(v));
  }
}

function decodeBase64(bytes: string): Uint8Array {
  return new Uint8Array(Buffer.from(bytes, "base64"));
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}
