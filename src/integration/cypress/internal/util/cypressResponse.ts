import { buildNotDisplayableMessage } from "@/integration/common/util/response";
import { CypressHttpResponse } from "@/integration/cypress/internal/cypressHttpResponse";
import { normalizeHeaders } from "@/integration/cypress/internal/util/headers";
import { HexString } from "@/type/hexString";
import { isReadableContentType } from "@/util/request";

const traceIdPropertyName = "__echoed_traceId";

type WrappedResponse = { [traceIdPropertyName]: HexString };

export function setTraceIdToCypressResponse(
  response: Cypress.Response<unknown> | CypressHttpResponse,
  traceId: HexString,
): void {
  (response as unknown as WrappedResponse)[traceIdPropertyName] = traceId;
}

export function getTraceIdFromCypressResponse(
  response: Cypress.Response<unknown> | CypressHttpResponse,
): HexString | undefined {
  return (response as unknown as WrappedResponse)[traceIdPropertyName];
}

export function readCypressResponseText(
  response: Cypress.Response<unknown> | CypressHttpResponse,
): string {
  const contentType = extractContentType(response);

  if (isReadableContentType(contentType)) {
    if (typeof response.body === "string") {
      return response.body;
    } else {
      return JSON.stringify(response.body);
    }
  }

  return buildNotDisplayableMessage(contentType);
}

function extractContentType(
  response: Cypress.Response<unknown> | CypressHttpResponse,
): string {
  const headers = normalizeHeaders(response.headers);
  for (const [key, value] of headers.entries()) {
    if (key.toLowerCase() === "content-type") {
      if (value.length === 0) {
        continue;
      }

      return value[0];
    }
  }

  return "";
}
