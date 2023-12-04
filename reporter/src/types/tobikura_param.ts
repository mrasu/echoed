export type ITobikuraParam = {
  testInfos?: ITestInfo[];
};

export type ITestInfo = {
  testId: string;
  file: string;
  name: string;
  status: string;
  orderedTraceIds: string[];
  fetches: IFetch[];
  spans?: ISpan[];
  logRecords?: ILogRecord[];
  failureDetails?: string[];
  failureMessages?: string[];
  duration?: number;
};

export type IFetch = {
  traceId: string;
  response: IFetchResponse;
  request: IFetchRequest;
};

export type IFetchResponse = {
  status: number;
  body?: string;
};

export type IFetchRequest = {
  url: string;
  method: string;
  body?: string;
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
  code?: number | null;
};
