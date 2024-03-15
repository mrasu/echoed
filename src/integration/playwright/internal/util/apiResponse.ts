import { buildNotDisplayableMessage } from "@/integration/common/util/response";
import { Base64String } from "@/type/base64String";
import { isReadableContentType } from "@/util/request";
import { APIResponse } from "@playwright/test";

const traceIdPropertyName = "__echoed_traceId";

export type WrappedResponse = { [traceIdPropertyName]: Base64String };

export function setTraceIdToAPIResponse(
  response: APIResponse,
  traceId: Base64String,
): void {
  (response as unknown as WrappedResponse)[traceIdPropertyName] = traceId;
}

export function getTraceIdFromAPIResponse(
  response: APIResponse,
): Base64String | undefined {
  return (response as unknown as WrappedResponse)[traceIdPropertyName];
}

export async function readAPIResponseText(
  response: APIResponse,
): Promise<string> {
  const contentType = extractContentType(response);

  if (isReadableContentType(contentType)) {
    return await response.text();
  }

  return buildNotDisplayableMessage(contentType);
}

function extractContentType(response: APIResponse): string {
  for (const [key, value] of Object.entries(response.headers())) {
    if (key.toLowerCase() === "content-type") {
      return value;
    }
  }

  return "";
}
