import { CypressHttpRequest } from "@/integration/cypress/internal/cypressHttpRequest";
import {
  normalizeHeaders,
  normalizeRequestOptionHeaders,
} from "@/integration/cypress/internal/util/headers";
import { ECHOED_USER_AGENT, USER_AGENT_HEADER_KEY } from "@/server/request";

export function isEchoedHttpRequest(request: CypressHttpRequest): boolean {
  const headers = normalizeHeaders(request.headers);
  return hasEchoedUserAgent(headers);
}

export function isEchoedRequestOption(
  opts: Partial<Cypress.RequestOptions>,
): boolean {
  const headers = normalizeRequestOptionHeaders(opts.headers);
  return hasEchoedUserAgent(headers);
}

function hasEchoedUserAgent(headers: Map<string, string[]>): boolean {
  for (const [key, values] of headers.entries()) {
    if (key !== USER_AGENT_HEADER_KEY) continue;

    return values.includes(ECHOED_USER_AGENT);
  }

  return false;
}
