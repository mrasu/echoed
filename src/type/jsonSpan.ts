export type jsonSpan = {
  attributes: jsonKeyValue[];
  traceId: string;
  spanId: string;
  parentSpanId: string;
  name?: string;
  startTimeUnixNano?: jsonLong;
  endTimeUnixNano?: jsonLong;
  events?: jsonEvent[];
  links?: jsonLink[];
  kind?: string;
  status?: jsonStatus;
  resource?: jsonResource;
  scope?: jsonInstrumentationScope;
};

export type jsonLong = string;

export type jsonKeyValue = {
  key?: string | null;
  value?: jsonAnyValue | null;
};

export type jsonAnyValue = {
  stringValue?: string | null;
  boolValue?: boolean | null;
  intValue?: jsonLong | null;
  doubleValue?: number | null;
  arrayValue?: jsonArrayValue | null;
  kvlistValue?: jsonKeyValueList | null;
  bytesValue?: string | null;
};

export type jsonArrayValue = {
  values?: jsonAnyValue[] | null;
};

export type jsonKeyValueList = {
  values?: jsonKeyValue[] | null;
};

export type jsonEvent = {
  timeUnixNano?: jsonLong | null;
  name?: string | null;
  attributes?: jsonKeyValue[] | null;
  droppedAttributesCount?: number | null;
};

export type jsonLink = {
  traceId?: string | null;
  spanId?: string | null;
  traceState?: string | null;
  attributes?: jsonKeyValue[] | null;
  droppedAttributesCount?: number | null;
};

export type jsonStatus = {
  message?: string | null;
  code?: number | null;
};

export type jsonResource = {
  attributes?: jsonKeyValue[] | null;
  droppedAttributesCount?: number | null;
};

export type jsonInstrumentationScope = {
  name?: string | null;
  version?: string | null;
  attributes?: jsonKeyValue[] | null;
  droppedAttributesCount?: number | null;
};
