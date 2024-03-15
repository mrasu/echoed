import { Base64String } from "@/type/base64String";

const traceIdPropertyName = "__echoed_traceId";

export type WrappedResponse = { [traceIdPropertyName]: Base64String };

export function setTraceIdToResponse(
  response: Response,
  traceId: Base64String,
): void {
  (response as unknown as WrappedResponse)[traceIdPropertyName] = traceId;
}

export function getTraceIdFromResponse(
  response: Response,
): Base64String | undefined {
  return (response as unknown as WrappedResponse)[traceIdPropertyName];
}
