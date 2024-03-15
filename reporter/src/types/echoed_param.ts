import type { HttpMethod } from "@/lib/util/http";

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
  kind?: string;
  status?: IStatus;
  resource?: IResource;
  scope?: IInstrumentationScope;
};

export type ILogRecord = {
  traceId?: string | null;
  spanId?: string | null;
  timeUnixNano?: ILongable | null;
  observedTimeUnixNano?: ILongable | null;
  severityNumber?: string | null;
  severityText?: string | null;
  body?: IAnyValue | null;
  attributes?: IKeyValue[] | null;
  droppedAttributesCount?: number | null;
  flags?: number | null;
};

export type ILongable = string;

export type IKeyValue = {
  key?: string | null;
  value?: IAnyValue | null;
};

export type IAnyValue = {
  stringValue?: string | null;
  boolValue?: boolean | null;
  intValue?: ILongable | null;
  doubleValue?: number | null;
  arrayValue?: IArrayValue | null;
  kvlistValue?: IKeyValueList | null;
  bytesValue?: string | null;
};

export type IArrayValue = {
  values?: IAnyValue[] | null;
};

export type IKeyValueList = {
  values?: IKeyValue[] | null;
};

export type IEvent = {
  timeUnixNano?: ILongable | null;
  name?: string | null;
  attributes?: IKeyValue[] | null;
  droppedAttributesCount?: number | null;
};

export type ILink = {
  traceId?: string | null;
  spanId?: string | null;
  traceState?: string | null;
  attributes?: IKeyValue[] | null;
  droppedAttributesCount?: number | null;
};

export type IStatus = {
  message?: string | null;
  code?: string | null;
};

export type IResource = {
  attributes?: IKeyValue[] | null;
  droppedAttributesCount?: number | null;
};

export type IInstrumentationScope = {
  name?: string | null;
  version?: string | null;
  attributes?: IKeyValue[] | null;
  droppedAttributesCount?: number | null;
};

export type ICoverageInfo = {
  serviceName: string;
  serviceNamespace?: string | null;
  httpCoverage?: IHttpCoverage;
  rpcCoverage?: IRpcCoverage;
  unmeasuredTraceIds?: string[];
};

export type IHttpCoverage = {
  operationCoverages: IHttpOperationCoverage[];
  undocumentedOperations: IHttpOperationTraces[];
};

export type IHttpOperationCoverage = {
  path: string;
  method: HttpMethod;
  passed: boolean;
};

export type IHttpOperationTraces = {
  path: string;
  method: HttpMethod;
  traceIds: string[];
};

export type IRpcCoverage = {
  methodCoverages: IRpcMethodCoverage[];
  undocumentedMethods: IRpcMethodTraces[];
};

export type IRpcMethodCoverage = {
  service: string;
  method: string;
  passed: boolean;
};

export type IRpcMethodTraces = {
  service: string;
  method: string;
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
