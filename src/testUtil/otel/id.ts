import { HexString } from "@/type/hexString";
import { buildRandomHexBytes, buildRandomHexUUID } from "@/util/random";

export function buildTraceId(): HexString {
  return new HexString(buildRandomHexUUID());
}

export function buildSpanId(): HexString {
  return new HexString(buildRandomHexBytes(8));
}
