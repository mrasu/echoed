import { Base64String } from "@/type/base64String";
import { hexToBase64 } from "@/util/byte";
import crypto from "crypto";

export function generateTraceparent(): {
  traceparent: string;
  traceId: Base64String;
} {
  const uuid = crypto.randomUUID();
  const traceId = uuid.replace(/-/g, "");
  const spanId = crypto.randomBytes(8).toString("hex");

  const traceparent = `00-${traceId}-${spanId}-01`;

  return { traceparent, traceId: hexToBase64(traceId) };
}
