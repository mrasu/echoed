import { mock } from "jest-mock-extended";
import { MockProxy } from "jest-mock-extended/lib/Mock";
import { Request } from "playwright-core";

const DEFAULT_REQUEST = {
  headers: {},
  url: "https://example.com/dummy",
  method: "GET",
};

export function buildPlaywrightRequest(
  overrides: Partial<typeof DEFAULT_REQUEST> = {},
): MockProxy<Request> {
  const returnValues = {
    ...DEFAULT_REQUEST,
    ...overrides,
  };

  const request = mock<Request>();
  request.headers.calledWith().mockReturnValue(returnValues.headers);
  request.url.calledWith().mockReturnValue(returnValues.url);
  request.method.calledWith().mockReturnValue(returnValues.method);

  return request;
}
