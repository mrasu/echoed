import { JsonSpan } from "@/type/jsonSpan";

const DEFAULT_JSON_SPAN = {
  name: "testSpan",
  attributes: [],
  parentSpanId: "",
  spanId: "",
  traceId: "",
};

export function buildJsonSpan(overrides: Partial<JsonSpan> = {}): JsonSpan {
  return {
    ...DEFAULT_JSON_SPAN,
    ...overrides,
  };
}
