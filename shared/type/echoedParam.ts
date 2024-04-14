import { type HttpMethod } from "@shared/type/http";

export type IEchoedParam = {
  config: IConfig;
  testInfos: ITestInfo[];
  coverageInfos: ICoverageInfo[];
  propagationFailedTraces: IPropagationFailedTrace[];
  traces: ITrace[];
};

export type IConfig = {
  propagationTestEnabled: boolean;
};

export type ITestInfo = {
  testId: string;
  file: string;
  name: string;
  startTimeMillis: number;
  status: string;
  orderedTraceIds: string[];
  fetches: IFetch[];
  failureDetails?: string[];
  failureMessages?: string[];
  duration?: number;
};

export type IFetch = {
  traceId: string;
  request: IFetchRequest;
  response: IFetchResponse | IFetchFailedResponse;
};

export type IFetchRequest = {
  url: string;
  method: string;
  body?: string;
};

export type IFetchResponse = {
  status: number;
  body?: string;
};

export type IFetchFailedResponse = {
  failed: true;
  reason: string;
};

export type ISpan = {
  attributes: IKeyValue[];
  traceId: string;
  spanId: string;
  parentSpanId: string;
  name?: string;
  startTimeUnixNano?: ILongable;
  endTimeUnixNano?: ILongable;
  events?: IEvent[];
  links?: ILink[];
  kind?: SpanKind;
  status?: IStatus;
  resource?: IResource;
  scope?: IInstrumentationScope;
};

export const SpanKind = [
  "SPAN_KIND_UNSPECIFIED",
  "SPAN_KIND_INTERNAL",
  "SPAN_KIND_SERVER",
  "SPAN_KIND_CLIENT",
  "SPAN_KIND_PRODUCER",
  "SPAN_KIND_CONSUMER",
] as const;
export type SpanKind = (typeof SpanKind)[number];

export type ILogRecord = {
  traceId?: string;
  spanId?: string;
  timeUnixNano?: ILongable;
  observedTimeUnixNano?: ILongable;
  severityNumber?: string;
  severityText?: string;
  body?: IAnyValue;
  attributes?: IKeyValue[];
  droppedAttributesCount?: number;
  flags?: number;
};

export type ILongable = string;

export type IKeyValue = {
  key?: string;
  value?: IAnyValue;
};

export type IAnyValue = {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: ILongable;
  doubleValue?: number;
  arrayValue?: IArrayValue;
  kvlistValue?: IKeyValueList;
  base64BytesValue?: string;
};

export type IArrayValue = {
  values?: IAnyValue[];
};

export type IKeyValueList = {
  values?: IKeyValue[];
};

export type IEvent = {
  timeUnixNano?: ILongable;
  name?: string;
  attributes?: IKeyValue[];
  droppedAttributesCount?: number;
};

export type ILink = {
  traceId?: string;
  spanId?: string;
  traceState?: string;
  attributes?: IKeyValue[];
  droppedAttributesCount?: number;
};

export type IStatus = {
  message?: string;
  code?: StatusCode;
};

export const StatusCode = [
  "STATUS_CODE_UNSET",
  "STATUS_CODE_OK",
  "STATUS_CODE_ERROR",
] as const;
export type StatusCode = (typeof StatusCode)[number];

export type IResource = {
  attributes?: IKeyValue[];
  droppedAttributesCount?: number;
};

export type IInstrumentationScope = {
  name?: string;
  version?: string;
  attributes?: IKeyValue[];
  droppedAttributesCount?: number;
};

export type ICoverageInfo = {
  serviceName: string;
  serviceNamespace?: string;
  httpCoverage?: IHttpCoverage;
  rpcCoverage?: IRpcCoverage;
  unmeasuredTraceIds?: string[];
};

export type IHttpCoverage = {
  operationCoverages: IHttpOperationCoverage[];
  undocumentedOperations: IHttpOperationTraces[];
};

type HttpOperation = {
  path: string;
  method: HttpMethod;
};

export type IHttpOperationCoverage = HttpOperation & {
  passed: boolean;
};

export type IHttpOperationTraces = HttpOperation & {
  traceIds: string[];
};

export type IRpcCoverage = {
  methodCoverages: IRpcMethodCoverage[];
  undocumentedMethods: IRpcMethodTraces[];
};

type RpcMethod = {
  service: string;
  method: string;
};

export type IRpcMethodCoverage = RpcMethod & {
  passed: boolean;
};

export type IRpcMethodTraces = RpcMethod & {
  traceIds: string[];
};

export type IPropagationFailedTrace = {
  traceId: string;
};

export type ITrace = {
  traceId: string;
  spans: ISpan[];
  logRecords: ILogRecord[];
};
