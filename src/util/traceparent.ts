import { HexString } from "@/type/hexString";
import { buildRandomHexBytes, buildRandomHexUUID } from "@/util/random";

export function generateTraceparent(): {
  traceparent: string;
  traceId: HexString;
} {
  const traceId = buildRandomHexUUID();
  const spanId = buildRandomHexBytes(8);

  const traceparent = `00-${traceId}-${spanId}-01`;

  return { traceparent, traceId: new HexString(traceId) };
}
