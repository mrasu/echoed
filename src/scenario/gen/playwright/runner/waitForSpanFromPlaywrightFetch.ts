import { SpanFilterOption, WaitOption } from "@/command/span";
import { KeyValue, Span } from "@/command/spanType";
import { waitForSpanFromPlaywrightFetch } from "@/integration/playwright";
import { EchoedContext } from "@/scenario/gen/common/context";
import { Option } from "@/scenario/gen/common/type";
import { Runner } from "@/scenario/gen/jest/runner/runner";
import { APIResponse } from "@playwright/test";

type WaitForSpanFromPlaywrightFetchArgument = {
  /**
   * Response object by Playwright methods like
   * [apiRequestContext.get(url[, options])](https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-get)
   * and similar methods.
   */
  response: APIResponse;

  /**
   * Filter option for waitForSpanFromPlaywrightFetch
   * Refer to `waitForSpanFromPlaywrightFetch` in "echoed" for more details
   */
  filter: SpanFilterOption;
  options?: WaitOption;
};

export type WaitForSpanResponse = Span & {
  getAttribute: (key: string) => KeyValue | undefined;
  resource: {
    getAttribute: (key: string) => KeyValue | undefined;
  };
};

/**
 * Run `waitForSpanFromPlaywrightFetch` by Echoed
 */
const wrappedWaitForSpanFromPlaywrightFetch = async (
  _ctx: EchoedContext,
  argument: WaitForSpanFromPlaywrightFetchArgument,
  _option: Option,
): Promise<WaitForSpanResponse> => {
  const span = await waitForSpanFromPlaywrightFetch(
    argument.response,
    argument.filter,
    argument.options,
  );

  return {
    ...span,
    getAttribute: (key: string): KeyValue | undefined =>
      span.attributes.find((attr) => attr.key === key),
    resource: {
      ...span.resource,
      getAttribute: (key: string): KeyValue | undefined =>
        span.resource?.attributes?.find((attr) => attr.key === key),
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _check: Runner = wrappedWaitForSpanFromPlaywrightFetch;

export { wrappedWaitForSpanFromPlaywrightFetch as waitForSpanFromPlaywrightFetch };
