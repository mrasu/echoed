import { jsonSpan } from "@/type/jsonSpan";

const DEFAULT_JSON_SPAN = {
  name: "testSpan",
  attributes: [],
  parentSpanId: "",
  spanId: "",
  traceId: "",
};

export function buildJsonSpan(overrides: Partial<jsonSpan> = {}): jsonSpan {
  return {
    ...DEFAULT_JSON_SPAN,
    ...overrides,
  };
}
