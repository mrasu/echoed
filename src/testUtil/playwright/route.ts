import { buildPlaywrightApiResponse } from "@/testUtil/playwright/apiResponse";
import { buildPlaywrightRequest } from "@/testUtil/playwright/request";
import { APIResponse, Route } from "@playwright/test";
import { mock } from "jest-mock-extended";
import { MockProxy } from "jest-mock-extended/lib/Mock";

const DEFAULT_ROUTE = {
  fetch: (): Promise<MockProxy<APIResponse>> => {
    return Promise.resolve(buildPlaywrightApiResponse());
  },
  request: buildPlaywrightRequest(),
};

export function buildRoute(
  overrides: Partial<typeof DEFAULT_ROUTE> = {},
): MockProxy<Route> {
  const returnValues = {
    ...DEFAULT_ROUTE,
    ...overrides,
  };

  const route = mock<Route>();
  route.fulfill.calledWith();
  route.fetch.calledWith().mockImplementation(returnValues.fetch);
  route.request.calledWith().mockReturnValue(returnValues.request);

  return route;
}
