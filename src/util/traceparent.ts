import { Base64String } from "@/type/base64String";
import { hexToBase64 } from "@/util/byte";
import { buildRandomHexBytes, buildRandomHexUUID } from "@/util/random";

export function generateTraceparent(): {
  traceparent: string;
  traceId: Base64String;
} {
  const traceId = buildRandomHexUUID();
  const spanId = buildRandomHexBytes(8);

  const traceparent = `00-${traceId}-${spanId}-01`;

  return { traceparent, traceId: hexToBase64(traceId) };
}
