import { opentelemetry } from "@/generated/otelpbj";
import { OtelSpan } from "@/type/otelSpan";

type ISpan = opentelemetry.proto.trace.v1.ISpan;

const DEFAULT_TRACE_ID = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
const DEFAULT_HTTP_SPAN: ISpan = {
  traceId: DEFAULT_TRACE_ID,
  attributes: [
    {
      key: "url.path",
      value: {
        stringValue: "/awesome/path",
      },
    },
    {
      key: "http.request.method",
      value: {
        stringValue: "POST",
      },
    },
  ],
};

const DEFAULT_PROTO_SPAN: ISpan = {
  traceId: DEFAULT_TRACE_ID,
  attributes: [
    {
      key: "rpc.service",
      value: {
        stringValue: "myPackage.CartService",
      },
    },
    {
      key: "rpc.method",
      value: {
        stringValue: "AddItem",
      },
    },
  ],
};

export function buildHttpOtelSpan(span: Partial<ISpan> = {}): OtelSpan {
  return new OtelSpan({
    ...DEFAULT_HTTP_SPAN,
    ...span,
  });
}

export function buildProtoOtelSpan(span: Partial<ISpan> = {}): OtelSpan {
  return new OtelSpan({
    ...DEFAULT_PROTO_SPAN,
    ...span,
  });
}
