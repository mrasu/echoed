import { APIResponse } from "@playwright/test";
import { mock } from "jest-mock-extended";
import { MockProxy } from "jest-mock-extended/lib/Mock";

const DEFAULT_API_RESPONSE = {
  url: "https://example.com",
  body: `{"message": "Hello, World!"}`,
  headers: {
    "content-type": "application/json",
  },
  ok: true,
  status: 200,
  statusText: "OK",
};

export function buildPlaywrightApiResponse(
  overrides: Partial<typeof DEFAULT_API_RESPONSE> = {},
): MockProxy<APIResponse> {
  const returnValues = {
    ...DEFAULT_API_RESPONSE,
    ...overrides,
  };

  const response = mock<APIResponse>();
  response.body.calledWith().mockResolvedValue(Buffer.from(returnValues.body));
  response.headers.calledWith().mockReturnValue(returnValues.headers);
  response.headersArray.calledWith().mockReturnValue(
    Object.entries(returnValues.headers).map(([name, value]) => ({
      name,
      value,
    })),
  );
  response.json.calledWith().mockImplementation(() => {
    return Promise.resolve(JSON.parse(returnValues.body));
  });
  response.ok.calledWith().mockReturnValue(returnValues.ok);
  response.status.calledWith().mockReturnValue(returnValues.status);
  response.statusText.calledWith().mockReturnValue(returnValues.statusText);
  response.text.calledWith().mockResolvedValue(returnValues.body);
  response.url.calledWith().mockReturnValue(returnValues.url);

  return response;
}
