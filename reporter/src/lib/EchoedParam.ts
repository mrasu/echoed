import { Buffer } from "buffer";
import {
  type ILongable,
  type IEchoedParam,
  type ISpan,
  type IKeyValue,
  type IEvent,
  type ILink,
  type IStatus,
  type IKeyValueList,
  type IAnyValue,
  type IArrayValue,
  type ITestInfo,
  type ILogRecord,
  type IResource,
  type IInstrumentationScope,
  type IFetch,
  type IFetchRequest,
  type IFetchResponse,
  type ITrace,
  type IConfig,
  type ICoverageInfo,
  type IHttpCoverage,
  type IHttpOperationCoverage,
  type IRpcCoverage,
  type IRpcMethodCoverage,
  type IPropagationFailedTrace,
  type IHttpOperationTraces,
  type IRpcMethodTraces,
  type IFetchFailedResponse,
  SpanKind,
  StatusCode,
} from "../../../shared/type/echoedParam";
import Long from "long";
import type { HttpMethod } from "./util/http";

const Million = 1000 * 1000;

export class EchoedParam {
  static convert(param: IEchoedParam): EchoedParam {
    const config = new Config(param.config);

    const testInfos = param.testInfos.map((testInfo) => new TestInfo(testInfo));
    const propagationFailedTraces = param.propagationFailedTraces.map(
      (trace) => new PropagationFailedTrace(trace),
    );

    const coverageInfos = param.coverageInfos.map((i) => new CoverageInfo(i));

    const traces = new Traces(param.traces);

    return new EchoedParam(
      config,
      testInfos,
      propagationFailedTraces,
      coverageInfos,
      traces,
    );
  }

  constructor(
    public config: Config,
    public testInfos: TestInfo[],
    public propagationFailedTraces: PropagationFailedTrace[],
    public coverageInfos: CoverageInfo[],
    public traces: Traces,
  ) {}

  pickTest(testId: string): TestInfo | undefined {
    return this.testInfos.find((testInfo) => testInfo.testId === testId);
  }

  pickCoverageInfoFromEncodedServiceName(
    encodedFullServiceName: string,
  ): CoverageInfo | undefined {
    const fullServiceName = decodeURIComponent(encodedFullServiceName);
    const service = Service.fromFullServiceName(fullServiceName);
    return this.coverageInfos.find((info) => info.service.equals(service));
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
    this.orderedTraceIds = testInfo.orderedTraceIds.map((traceId) => traceId);

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
  response: FetchResponse | FetchFailedResponse;

  constructor(fetch: IFetch) {
    this.traceId = fetch.traceId;
    this.request = new FetchRequest(fetch.request);

    const response = fetch.response;
    this.response =
      "failed" in response
        ? new FetchFailedResponse(response)
        : new FetchResponse(response);
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

export class FetchFailedResponse {
  failed: true;
  reason: string;

  constructor(response: IFetchFailedResponse) {
    this.failed = response.failed;
    this.reason = response.reason;
  }
}

const DEFAULT_SPAN_NAME = "[unknown]";

export class Span {
  service: Service;
  traceId: string;
  spanId: string;
  parentSpanId: string;
  name: string;
  startTimeUnixNano?: Long;
  endTimeUnixNano?: Long;
  events?: Event[];
  links?: Link[];
  kind?: SpanKind;
  status?: Status;
  resource?: Resource;
  scope?: InstrumentationScope;

  attributes: Attributes;

  constructor(span: ISpan) {
    this.attributes = new Attributes(span.attributes);

    this.traceId = span.traceId;
    this.spanId = span.spanId;
    this.parentSpanId = span.parentSpanId;
    this.name = span.name || DEFAULT_SPAN_NAME;
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

    const serviceName =
      this.resource?.getAttribute("service.name")?.value?.stringValue;
    const serviceNamespace =
      this.resource?.getAttribute("service.namespace")?.value?.stringValue;
    this.service = new Service(serviceName, serviceNamespace);
  }

  get isRoot(): boolean {
    return this.parentSpanId === "";
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

    return this.status.code !== "STATUS_CODE_ERROR";
  }
}

export class Attributes {
  private attributesMap: Map<string, KeyValue>;

  constructor(attributes: IKeyValue[] | null | undefined) {
    const attributesMap = new Map<string, KeyValue>();
    for (const kv of attributes || []) {
      if (!kv.key) continue;
      attributesMap.set(kv.key, new KeyValue(kv));
    }

    this.attributesMap = attributesMap;
  }

  getOrderedKeyValues(): KeyValue[] {
    return [...this.attributesMap.values()].sort((a, b) => {
      if (a.key && b.key) {
        return a.key.localeCompare(b.key);
      }
      if (a.key) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  get size(): number {
    return this.attributesMap.size;
  }

  get(key: string): KeyValue | undefined {
    return this.attributesMap.get(key);
  }
}

// Attribute for `service.name` is considered "unknown_service" if not specified
//
// c.f. https://opentelemetry.io/docs/specs/semconv/resource/#service
// > If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with `process.executable.name`, e.g. `unknown_service:bash`.
// > If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
const DEFAULT_SERVICE_NAME = "unknown_service";

export class Service {
  name: string;
  namespace?: string;

  static fromFullServiceName(fullServiceName: string): Service {
    const [namespace, ...rest] = fullServiceName.split("/");
    const name = rest.join("/");

    if (namespace === "") {
      return new Service(name, undefined);
    }
    return new Service(name, namespace);
  }

  constructor(
    name: string | undefined | null,
    namespace: string | undefined | null,
  ) {
    this.name = name ?? DEFAULT_SERVICE_NAME;
    this.namespace = namespace ?? undefined;
  }

  equals(other: Service): boolean {
    if (this.name !== other.name) return false;
    if (!other.namespace) {
      return this.namespace === undefined;
    }

    return this.namespace === other.namespace;
  }

  get fullServiceName(): string {
    return `${this.namespace ?? ""}/${this.name}`;
  }

  get urlEncodedFullServiceName(): string {
    return encodeURIComponent(this.fullServiceName);
  }

  get fullDisplayServiceName(): string {
    if (this.namespace) {
      return `${this.namespace}/${this.name}`;
    } else {
      return this.name;
    }
  }

  compareSortByServiceName(other: Service): number {
    if (this.namespace || other.namespace) {
      if (!this.namespace) {
        return -1;
      }
      if (!other.namespace) {
        return 1;
      }
      if (this.namespace !== other.namespace) {
        return this.namespace < other.namespace ? -1 : 1;
      }
    }

    if (this.name === other.name) {
      return 0;
    }
    return this.name < other.name ? -1 : 1;
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
    this.traceId = link.traceId ? link.traceId : undefined;
    this.spanId = link.spanId ? link.spanId : undefined;
    this.traceState = link.traceState || undefined;
    this.attributes = link.attributes?.map((kv) => new KeyValue(kv));
    this.droppedAttributesCount = link.droppedAttributesCount || undefined;
  }
}

export class Status {
  message?: string;
  code?: StatusCode;

  constructor(status: IStatus) {
    this.message = status.message || undefined;
    this.code = status.code || undefined;
  }
}

export class Resource {
  droppedAttributesCount?: number;

  attributes: Attributes;

  constructor(resource: IResource) {
    this.attributes = new Attributes(resource.attributes);

    this.droppedAttributesCount = resource.droppedAttributesCount || undefined;
  }

  getAttribute(key: string): KeyValue | undefined {
    return this.attributes.get(key);
  }
}

export class InstrumentationScope {
  name?: string;
  version?: string;
  attributes: Attributes;
  droppedAttributesCount?: number;

  constructor(status: IInstrumentationScope) {
    this.name = status.name || undefined;
    this.version = status.version || undefined;
    this.attributes = new Attributes(status.attributes);
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
  attributes: Attributes;
  droppedAttributesCount?: number;
  flags?: number;

  constructor(logRecord: ILogRecord) {
    this.traceId = logRecord.traceId ?? undefined;
    this.spanId = logRecord.spanId ?? undefined;
    this.timeUnixNano = logRecord.timeUnixNano
      ? Long.fromString(logRecord.timeUnixNano)
      : undefined;
    this.observedTimeUnixNano = logRecord.observedTimeUnixNano
      ? Long.fromString(logRecord.observedTimeUnixNano)
      : undefined;
    this.severityNumber = logRecord.severityNumber || undefined;
    this.severityText = logRecord.severityText || undefined;
    this.body = logRecord.body ? new AnyValue(logRecord.body) : undefined;
    this.attributes = new Attributes(logRecord.attributes);
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
    this.bytesValue = value.base64BytesValue
      ? decodeBase64(value.base64BytesValue)
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
  service: Service;
  httpCoverage?: HttpCoverage;
  rpcCoverage?: RpcCoverage;
  unmeasuredTraceIds: string[];

  constructor(coverage: ICoverageInfo) {
    this.service = new Service(coverage.serviceName, coverage.serviceNamespace);
    this.httpCoverage = coverage.httpCoverage
      ? new HttpCoverage(coverage.httpCoverage)
      : undefined;
    this.rpcCoverage = coverage.rpcCoverage
      ? new RpcCoverage(coverage.rpcCoverage)
      : undefined;

    this.unmeasuredTraceIds = coverage.unmeasuredTraceIds ?? [];
  }

  get urlEncodedFullServiceName(): string {
    return this.service.urlEncodedFullServiceName;
  }

  get fullDisplayServiceName(): string {
    return this.service.fullDisplayServiceName;
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
    return this.service.compareSortByServiceName(other.service);
  }
}

export class HttpCoverage {
  operationCoverages: HttpOperationCoverage[];
  undocumentedOperations: HttpOperationTraces[];

  passedCount: number;

  constructor(coverage: IHttpCoverage) {
    this.operationCoverages = coverage.operationCoverages.map(
      (c) => new HttpOperationCoverage(c),
    );
    this.undocumentedOperations = coverage.undocumentedOperations.map(
      (c) => new HttpOperationTraces(c),
    );

    this.passedCount = this.operationCoverages.filter((c) => c.passed).length;
  }

  get coverageRatio(): number {
    return this.passedCount / this.operationCoverages.length;
  }

  pickUndocumentedOperationTracesFor(
    method: HttpMethod,
    path: string,
  ): HttpOperationTraces | undefined {
    return this.undocumentedOperations.find(
      (op) => op.method === method && op.path === path,
    );
  }
}

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

export class HttpOperationTraces {
  path: string;
  method: HttpMethod;
  traceIds: string[];

  constructor(traces: IHttpOperationTraces) {
    this.path = traces.path;
    this.method = traces.method;
    this.traceIds = traces.traceIds;
  }
}

export class RpcCoverage {
  methodCoverages: RpcMethodCoverage[];
  undocumentedMethods: RpcMethodTraces[];

  passedCount: number;

  constructor(coverage: IRpcCoverage) {
    this.methodCoverages = coverage.methodCoverages.map(
      (c) => new RpcMethodCoverage(c),
    );
    this.undocumentedMethods = coverage.undocumentedMethods.map(
      (c) => new RpcMethodTraces(c),
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

  pickUndocumentedMethodTracesFor(
    service: string,
    method: string,
  ): RpcMethodTraces | undefined {
    return this.undocumentedMethods.find(
      (op) => op.service === service && op.method === method,
    );
  }
}

export class RpcMethodCoverage {
  service: string;
  method: string;
  passed: boolean;

  constructor(coverage: IRpcMethodCoverage) {
    this.service = coverage.service;
    this.method = coverage.method;
    this.passed = coverage.passed;
  }
}

export class RpcMethodTraces {
  service: string;
  method: string;
  traceIds: string[];

  constructor(traces: IRpcMethodTraces) {
    this.service = traces.service;
    this.method = traces.method;
    this.traceIds = traces.traceIds;
  }
}

export class PropagationFailedTrace {
  traceId: string;

  constructor(propagationFailedTrace: IPropagationFailedTrace) {
    this.traceId = propagationFailedTrace.traceId;
  }
}

export class Traces {
  traceMap: Map<string, Trace>;

  constructor(traces: ITrace[]) {
    this.traceMap = new Map<string, Trace>(
      traces.map((trace) => [trace.traceId, new Trace(trace)]),
    );
  }

  get(traceId: string): Trace | undefined {
    return this.traceMap.get(traceId);
  }

  getOrEmpty(traceId: string): Trace {
    const trace = this.get(traceId);
    if (trace) return trace;

    return new Trace({
      traceId: traceId,
      spans: [],
      logRecords: [],
    });
  }
}

export class Trace {
  traceId: string;
  spans: Span[];
  logRecords: LogRecord[];

  constructor(trace: ITrace) {
    this.traceId = trace.traceId;
    this.spans = trace.spans.map((span: ISpan) => new Span(span));
    this.logRecords = trace.logRecords.map(
      (log: ILogRecord) => new LogRecord(log),
    );
  }

  get rootSpan(): Span | undefined {
    return this.spans.find((span: Span) => span.isRoot);
  }

  get rootSpanName(): string {
    return this.rootSpan?.name ?? DEFAULT_SPAN_NAME;
  }

  getRootSpanFor(service: Service): Span | undefined {
    const spans = this.spans.filter((span: Span) =>
      span.service.equals(service),
    );
    if (spans.length === 0) {
      return;
    }

    const rootSpanIdMap = new Map<string, Span>(
      spans.map((span) => [span.spanId, span]),
    );
    const spanIds = rootSpanIdMap.keys();
    for (const spanId of spanIds) {
      const span = rootSpanIdMap.get(spanId);
      if (!span) continue;
      if (!span.parentSpanId) continue;

      if (rootSpanIdMap.has(span.parentSpanId)) {
        rootSpanIdMap.delete(spanId);
      }
    }

    const rootSpans = [...rootSpanIdMap.values()];
    if (rootSpans.length === 0) {
      return;
    }
    return rootSpans[0];
  }

  findSpan(spanId: string): Span | undefined {
    return this.spans.find((span) => span.spanId === spanId);
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
