import { waitForSpan } from "@/command";
import { SpanFilterOption, WaitOption } from "@/command/span";
import { KeyValue, Span } from "@/command/spanType";
import { EchoedContext } from "@/scenario/gen/common/context";
import { Option } from "@/scenario/gen/common/type";
import { Runner } from "@/scenario/gen/jest/runner/runner";

type Argument = {
  /**
   * Response object from request
   * This will be used to extract OpenTelemetry's TraceId used for the request
   */
  response: Response;

  /**
   * Filter option for waitForSpan
   * Refer to `waitForSpan` in "echoed" for more details
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
 * Run `waitForSpan` by Echoed
 */
const wrappedWaitForSpan = async (
  _ctx: EchoedContext,
  argument: Argument,
  _option: Option,
): Promise<WaitForSpanResponse> => {
  const span = await waitForSpan(
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
const _check: Runner = wrappedWaitForSpan;

export { wrappedWaitForSpan as waitForSpan };
