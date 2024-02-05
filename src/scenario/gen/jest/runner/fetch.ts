import { EchoedContext } from "@/scenario/gen/common/context";
import { Runner } from "@/scenario/gen/jest/runner/runner";
import { joinUrl } from "@/util/url";

type Argument = {
  /**
   * Endpoint to fetch
   * When baseEndpoint is set in Option, argument's endpoint will be combined with baseEndpoint
   */
  endpoint: string;

  /**
   * HTTP method
   */
  method?: string;

  /**
   * Request body that will be transformed with JSON.stringify
   * When both jsonBody and txtBody are set, jsonBody will be used
   */
  jsonBody?: unknown;

  /**
   * Request body that will be used as is
   * When both jsonBody and txtBody are set, jsonBody will be used
   */
  txtBody?: string;

  /**
   * Headers to for the request
   * When both headers and option's headers have the same key, the values of this "headers" will be used
   *
   * @example
   * When
   *   * this header is { "Content-Type": "application/json" }
   *   * option's headers is { "Authorization": "Bearer token", "Content-Type": "text/plain" }
   * actual headers will be { "Authorization": "Bearer token", "Content-Type": "application/json" }
   */
  headers?: Record<string, string>;

  /**
   * Additional argument for fetch
   */
  init?: RequestInit;
};

type Option = {
  /**
   * When baseEndpoint is set, argument's endpoint will be combined with baseEndpoint
   * Note that whether endpoint is finished with slash or not, last part of baseEndpoint is considered as directory
   *
   * @example
   * When argument's endpoint is "v1/hello", whether baseEndpoint is "https://example.com/api" or "https://example.com/api/", the result will be the same: "https://example.com/api/v1/hello"
   *
   * Below table shows the result of different combination of baseEndpoint and endpoint
   * | baseEndpoint | endpoint | result |
   * | ------------ | -------- | ------ |
   * | https://example.com/api  | v1/hello  | https://example.com/api/v1/hello |
   * | https://example.com/api/ | v1/hello  | https://example.com/api/v1/hello |
   * | https://example.com/api  | /v1/hello | https://example.com/v1/hello |
   * | https://example.com/api  | ../hello  | https://example.com/hello |
   */
  baseEndpoint?: string;

  /**
   * Headers for the request
   */
  headers?: Record<string, string>;
};

export type FetchResponse = {
  /**
   * Response object from fetch
   */
  response: Response;

  /**
   * Response body as text
   */
  textBody: string;

  /**
   * Response body transformed to JSON
   */
  jsonBody: unknown;
};

/**
 * Run built-in fetch
 */
const wrappedFetch = async (
  _ctx: EchoedContext,
  argument: Argument,
  option: Option,
): Promise<FetchResponse> => {
  const { endpoint, method, jsonBody, txtBody, headers, init } = argument;

  const body = jsonBody ? JSON.stringify(jsonBody) : txtBody;

  const targetEndpoint = buildEndpoint(option, endpoint);
  const mergedHeaders = {
    ...option.headers,
    ...headers,
  };
  const response = await fetch(targetEndpoint, {
    ...init,
    method,
    headers: mergedHeaders,
    body,
  });

  const clonedResponse = response.clone();
  const responseTextBody = await clonedResponse.text();
  let responseJsonBody: unknown = undefined;
  try {
    responseJsonBody = JSON.parse(responseTextBody);
  } catch (e) {
    // ignore
  }

  return {
    response,
    textBody: responseTextBody,
    jsonBody: responseJsonBody,
  };
};

const buildEndpoint = (option: Option, endpoint: string): string => {
  if (!option.baseEndpoint) return endpoint;

  return joinUrl(option.baseEndpoint, endpoint);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _check: Runner = wrappedFetch;

export { wrappedFetch as fetch };
