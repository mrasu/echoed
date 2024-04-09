const DEFAULT_RESPONSE: Omit<Cypress.Response<unknown>, "body"> = {
  allRequestResponses: [],
  duration: 100,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  isOkStatusCode: true,
  redirects: undefined,
  redirectedToUrl: undefined,
  requestHeaders: {},
  status: 200,
  statusText: "OK",
};

export function buildCypressResponse<T>(
  override: Partial<Cypress.Response<T>> & { body: T },
): Cypress.Response<T> {
  return {
    ...DEFAULT_RESPONSE,
    ...override,
  };
}
