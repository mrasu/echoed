import { HexString } from "@/type/hexString";

const traceIdPropertyName = "__echoed_traceId";

export type WrappedResponse = { [traceIdPropertyName]: HexString };

export function setTraceIdToResponse(
  response: Response,
  traceId: HexString,
): void {
  (response as unknown as WrappedResponse)[traceIdPropertyName] = traceId;
}

export function getTraceIdFromResponse(
  response: Response,
): HexString | undefined {
  return (response as unknown as WrappedResponse)[traceIdPropertyName];
}
