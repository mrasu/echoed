import { CypressHttpResponse } from "@/integration/cypress/internal/cypressHttpResponse";

const DEFAULT_RESPONSE: CypressHttpResponse = {
  statusCode: 200,
  body: "test body",
  headers: {},
};

export function buildCypressHttpResponse(
  overrides: Partial<CypressHttpResponse> = {},
): CypressHttpResponse {
  return {
    ...DEFAULT_RESPONSE,
    ...overrides,
  };
}
