import { Base64String } from "@/type/base64String";
import { buildRandomHexBytes, buildRandomHexUUID } from "@/util/random";

export function buildTraceId(): Base64String {
  return new Base64String(buildRandomHexUUID());
}

export function buildSpanId(): Base64String {
  return new Base64String(buildRandomHexBytes(8));
}
