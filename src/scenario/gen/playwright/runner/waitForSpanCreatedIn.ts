import { SpanFilterOption, WaitOption } from "@/command/span";
import { KeyValue, Span } from "@/command/spanType";
import { waitForSpanCreatedIn } from "@/integration/playwright";
import { EchoedContext } from "@/scenario/gen/common/context";
import { Option } from "@/scenario/gen/common/type";
import { Runner } from "@/scenario/gen/jest/runner/runner";
import { BrowserContext } from "@playwright/test";

type WaitForSpanCreatedInArgument = {
  /**
   * Browser context request was made in
   */
  context: BrowserContext;

  /**
   * URL pattern to match the request
   */
  urlPattern: string | RegExp;

  /**
   * Filter option for waitForSpanCreatedIn
   * Refer to `waitForSpanCreatedIn` in "echoed" for more details
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
 * Run `waitForSpanCreatedIn` by Echoed
 */
const wrappedWaitForSpanCreatedIn = async (
  _ctx: EchoedContext,
  argument: WaitForSpanCreatedInArgument,
  _option: Option,
): Promise<WaitForSpanResponse> => {
  const span = await waitForSpanCreatedIn(
    argument.context,
    argument.urlPattern,
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
const _check: Runner = wrappedWaitForSpanCreatedIn;

export { wrappedWaitForSpanCreatedIn as waitForSpanCreatedIn };
