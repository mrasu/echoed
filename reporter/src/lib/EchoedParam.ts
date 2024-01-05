import { Buffer } from "buffer";
import type {
  ILongable,
  IEchoedParam,
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
  IResource,
  IInstrumentationScope,
  IFetch,
  IFetchRequest,
  IFetchResponse,
  ITrace,
  IConfig,
  ICoverageInfo,
  IHttpCoverage,
  IHttpOperationCoverage,
  IRpcCoverage,
  IRpcMethodCoverage,
} from "../types/echoed_param";
import Long from "long";

const Million = 1000 * 1000;

export class EchoedParam {
  static convert(param: IEchoedParam): EchoedParam {
    const config = new Config(param.config);

    const testInfos = param.testInfos.map((testInfo) => new TestInfo(testInfo));
    const propagationFailedTraces = param.propagationFailedTraces.map(
      (trace) => new Trace(trace),
    );

    const coverageInfos = param.coverageInfos.map((i) => new CoverageInfo(i));

    return new EchoedParam(
      config,
      testInfos,
      propagationFailedTraces,
      coverageInfos,
    );
  }

  constructor(
    public config: Config,
    public testInfos: TestInfo[],
    public propagationFailedTraces: Trace[],
    public coverageInfos: CoverageInfo[],
  ) {}

  pickTest(testId: string): TestInfo | undefined {
    return this.testInfos.find((testInfo) => testInfo.testId === testId);
  }

  pickPropagationFailedTrace(traceId: string): Trace | undefined {
    return this.propagationFailedTraces.find(
      (trace) => trace.traceId === traceId,
    );
  }

  pickCoverageInfo(serviceName: string): CoverageInfo | undefined {
    return this.coverageInfos.find((info) => info.serviceName === serviceName);
  }

  testInfosByFile(): Map<string, TestInfo[]> {
    const map = new Map<string, TestInfo[]>();
    this.testInfos.forEach((testInfo) => {
      const testInfos = map.get(testInfo.file) || [];
      testInfos.push(testInfo);
      map.set(testInfo.file, testInfos);
    });

    return map;
  }

  hasPropagationFailedTrace(): boolean {
    return this.propagationFailedTraces.length > 0;
  }
}

export class Config {
  public readonly propagationTestEnabled: boolean;

  constructor(conf: IConfig) {
    this.propagationTestEnabled = conf.propagationTestEnabled;
  }
}

// https://github.com/jestjs/jest/blob/e54c0ebb048e10331345dbe99f8ec07654a43f1c/packages/jest-util/src/specialChars.ts#L13
const testStatuses = [
  "passed",
  "failed",
  "skipped",
  "pending",
  "todo",
  "disabled",
  // "focused" appears when `.test.only()` is used.
  "focused",
];

type TestStatus = (typeof testStatuses)[number];

export class TestInfo {
  testId: string;
  file: string;
  name: string;
  startDate: Date;
  statusString: string;
  orderedTraceIds: string[];
  fetches: Fetch[];
  spans: Span[];
  logRecords: LogRecord[];
  failureDetails?: unknown[];
  failureMessages?: string[];
  duration?: number;

  constructor(testInfo: ITestInfo) {
    this.testId = testInfo.testId;
    this.file = testInfo.file;
    this.name = testInfo.name;
    this.startDate = new Date(testInfo.startTimeMillis);
    this.statusString = testInfo.status;
    this.fetches = testInfo.fetches.map((fetch) => new Fetch(fetch));
    this.orderedTraceIds = testInfo.orderedTraceIds.map((traceId) =>
      toHex(decodeBase64(traceId)),
    );
    this.spans = testInfo.spans?.map((span: ISpan) => new Span(span)) || [];
    this.logRecords =
      testInfo.logRecords?.map((log: ILogRecord) => new LogRecord(log)) || [];

    this.failureDetails = testInfo.failureDetails?.map((v) => JSON.parse(v));
    this.failureMessages = testInfo.failureMessages;
    this.duration = testInfo.duration;
  }

  get status(): TestStatus | undefined {
    if (testStatuses.includes(this.statusString)) {
      return this.statusString as TestStatus;
    }
    return undefined;
  }

  getFetchMapByTraceId(): Map<string, Fetch> {
    const map = new Map<string, Fetch>();
    this.fetches.forEach((fetch) => {
      map.set(fetch.traceId, fetch);
    });
    return map;
  }
}

export class Fetch {
  traceId: string;
  request: FetchRequest;
  response: FetchResponse;

  constructor(fetch: IFetch) {
    this.traceId = toHex(decodeBase64(fetch.traceId));
    this.request = new FetchRequest(fetch.request);
    this.response = new FetchResponse(fetch.response);
  }
}

export class FetchRequest {
  url: string;
  method: string;
  body?: string;

  constructor(request: IFetchRequest) {
    this.url = request.url;
    this.method = request.method;
    this.body = request.body;
  }
}

export class FetchResponse {
  status: number;
  body?: string;

  constructor(response: IFetchResponse) {
    this.status = response.status;
    this.body = response.body;
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
  resource?: Resource;
  scope?: InstrumentationScope;

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
    this.resource = span.resource ? new Resource(span.resource) : undefined;
    this.scope = span.scope ? new InstrumentationScope(span.scope) : undefined;
  }

  get isRoot(): boolean {
    return this.parentSpanId === "";
  }

  get serviceName(): string | undefined {
    const service = this.resource?.attributes?.find(
      (kv) => kv.key === "service.name",
    );
    return service?.value?.stringValue;
  }

  get serviceNamespace(): string | undefined {
    const service = this.resource?.attributes?.find(
      (kv) => kv.key === "service.namespace",
    );
    return service?.value?.stringValue;
  }

  get startTime(): Date {
    return new Date(this.startTimeMillis);
  }

  get startTimeMillis(): number {
    return nanoToMillis(this.startTimeUnixNano);
  }

  get endTime(): Date {
    return new Date(this.endTimeMillis);
  }

  get endTimeMillis(): number {
    return nanoToMillis(this.endTimeUnixNano);
  }

  get succeeded(): boolean {
    if (!this.status) {
      return true;
    }

    // 2 is ERROR
    return this.status.code !== 2;
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

export class Resource {
  attributes?: KeyValue[];
  droppedAttributesCount?: number;

  constructor(status: IResource) {
    this.attributes = status.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = status.droppedAttributesCount || undefined;
  }
}

export class InstrumentationScope {
  name?: string;
  version?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;

  constructor(status: IInstrumentationScope) {
    this.name = status.name || undefined;
    this.version = status.version || undefined;
    this.attributes = status.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = status.droppedAttributesCount || undefined;
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

  get bodyText(): string {
    return this.body?.displayText || "";
  }

  get time(): Date {
    return new Date(this.timeMillis);
  }

  get timeMillis(): number {
    return nanoToMillis(this.timeUnixNano);
  }

  get observedTime(): Date {
    return new Date(this.observedTimeMillis);
  }

  get observedTimeMillis(): number {
    return nanoToMillis(this.observedTimeUnixNano);
  }
}

export class KeyValue {
  key?: string;
  value?: AnyValue;

  constructor(kv: IKeyValue) {
    this.key = kv.key || undefined;
    this.value = kv.value ? new AnyValue(kv.value) : undefined;
  }

  get displayText(): string {
    return JSON.stringify({ key: this.key, value: this.value?.displayText });
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

  get displayText(): string {
    if (this.stringValue) {
      return this.stringValue;
    } else if (this.boolValue) {
      return this.boolValue ? "true" : "false";
    } else if (this.intValue) {
      return this.intValue;
    } else if (this.doubleValue) {
      return this.doubleValue.toString();
    } else if (this.bytesValue) {
      return toHex(this.bytesValue);
    } else if (this.arrayValue) {
      return this.arrayValue.values?.map((v) => v.displayText).join(", ") || "";
    } else if (this.kvlistValue) {
      return (
        this.kvlistValue.values?.map((kv) => kv.displayText).join(", ") || ""
      );
    } else {
      return "-";
    }
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

export class CoverageInfo {
  serviceName: string;
  serviceNamespace?: string;
  httpCoverage?: HttpCoverage;
  rpcCoverage?: RpcCoverage;

  constructor(coverage: ICoverageInfo) {
    this.serviceName = coverage.serviceName;
    this.serviceNamespace = coverage.serviceNamespace ?? undefined;
    this.httpCoverage = coverage.httpCoverage
      ? new HttpCoverage(coverage.httpCoverage)
      : undefined;
    this.rpcCoverage = coverage.rpcCoverage
      ? new RpcCoverage(coverage.rpcCoverage)
      : undefined;
  }

  get fullServiceName(): string {
    if (this.serviceNamespace) {
      return `${this.serviceNamespace}/${this.serviceName}`;
    } else {
      return this.serviceName;
    }
  }

  get coverageRatio(): number {
    if (this.httpCoverage) return this.httpCoverage.coverageRatio;
    if (this.rpcCoverage) return this.rpcCoverage.coverageRatio;

    return 0;
  }

  get coveragePercent(): string {
    return this.coverageRatio.toLocaleString("en", {
      style: "percent",
      minimumFractionDigits: 1,
    });
  }

  get passedCount(): number {
    if (this.httpCoverage) return this.httpCoverage.passedCount;
    if (this.rpcCoverage) return this.rpcCoverage.passedCount;

    return 0;
  }

  get pathCoverageLength(): number {
    if (this.httpCoverage) return this.httpCoverage.operationCoverages.length;
    if (this.rpcCoverage) return this.rpcCoverage.methodCoverages.length;

    return 0;
  }

  compareSortByServiceName(other: CoverageInfo): number {
    if (this.serviceNamespace || other.serviceNamespace) {
      if (!this.serviceNamespace) {
        return -1;
      }
      if (!other.serviceNamespace) {
        return 1;
      }
      if (this.serviceNamespace !== other.serviceNamespace) {
        return this.serviceNamespace < other.serviceNamespace ? -1 : 1;
      }
    }

    if (this.serviceName === other.serviceName) {
      return 0;
    }
    return this.serviceName < other.serviceName ? -1 : 1;
  }
}

export class HttpCoverage {
  operationCoverages: HttpOperationCoverage[];

  passedCount: number;

  constructor(coverage: IHttpCoverage) {
    this.operationCoverages = coverage.operationCoverages.map(
      (c) => new HttpOperationCoverage(c),
    );

    this.passedCount = this.operationCoverages.filter((c) => c.passed).length;
  }

  get coverageRatio(): number {
    return this.passedCount / this.operationCoverages.length;
  }
}

export const HttpMethods = [
  "get",
  "post",
  "put",
  "delete",
  "options",
  "head",
  "patch",
] as const;
export type HttpMethod = (typeof HttpMethods)[number];

export class HttpOperationCoverage {
  path: string;
  method: HttpMethod;
  passed: boolean;

  constructor(pathCoverage: IHttpOperationCoverage) {
    this.path = pathCoverage.path;
    this.method = pathCoverage.method;
    this.passed = pathCoverage.passed;
  }
}

export class RpcCoverage {
  methodCoverages: RpcMethodCoverage[];

  passedCount: number;

  constructor(coverage: IRpcCoverage) {
    this.methodCoverages = coverage.methodCoverages.map(
      (c) => new RpcMethodCoverage(c),
    );

    this.passedCount = this.methodCoverages.filter((c) => c.passed).length;
  }

  get coverageRatio(): number {
    return this.passedCount / this.methodCoverages.length;
  }

  get methodCoveragesGroupedByService(): Map<string, RpcMethodCoverage[]> {
    const map = new Map<string, RpcMethodCoverage[]>();
    this.methodCoverages.forEach((coverage) => {
      const coverages = map.get(coverage.service) || [];
      coverages.push(coverage);
      map.set(coverage.service, coverages);
    });

    return map;
  }
}

export class RpcMethodCoverage {
  service: string;
  method: string;
  passed: boolean;

  constructor(pathCoverage: IRpcMethodCoverage) {
    this.service = pathCoverage.service;
    this.method = pathCoverage.method;
    this.passed = pathCoverage.passed;
  }
}

export class Trace {
  traceId: string;
  spans: Span[];
  logRecords: LogRecord[];

  constructor(trace: ITrace) {
    this.traceId = toHex(decodeBase64(trace.traceId));
    this.spans = trace.spans.map((span: ISpan) => new Span(span));
    this.logRecords = trace.logRecords.map(
      (log: ILogRecord) => new LogRecord(log),
    );
  }

  get rootSpan(): Span | undefined {
    return this.spans.find((span: Span) => span.isRoot);
  }
}

function decodeBase64(bytes: string): Uint8Array {
  return new Uint8Array(Buffer.from(bytes, "base64"));
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

function nanoToMillis(nano: Long | undefined): number {
  if (!nano) return 0;
  return nano.toNumber() / Million;
}
