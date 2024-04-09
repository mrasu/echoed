import { CypressHttpRequest } from "@/integration/cypress/internal/cypressHttpRequest";
import { mock } from "jest-mock-extended";
import { MockProxy } from "jest-mock-extended/lib/Mock";

type CypressHttpRequestOverrides = CypressHttpRequest & {
  body: Partial<unknown>;
};

const DEFAULT_REQUEST: Omit<CypressHttpRequestOverrides, "on"> = {
  url: "https://example.com",
  method: "GET",
  body: "body",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (..) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/x.x.x",
  },
};

export function buildCypressRequest(
  overrides: Partial<CypressHttpRequestOverrides> = {},
): MockProxy<CypressHttpRequest> {
  const request = mock<CypressHttpRequest>({
    ...DEFAULT_REQUEST,
    ...overrides,
  });

  return request;
}
