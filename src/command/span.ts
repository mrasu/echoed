import {
  fulfillWaitOption,
  waitForSpanForTraceId,
} from "@/command/bridge/span";
import { Compare } from "@/command/compare";
import { Span } from "@/command/spanType";
import { EchoedFatalError } from "@/echoedFatalError";
import { getServerPortFromEnv } from "@/integration/common/util/env";
import { getTraceIdFromResponse } from "@/integration/common/util/fetchResponse";

export type WaitOption = {
  timeoutMs?: number;
};

export type AttributeValueOption = string | boolean | number | RegExp | Compare;

export type SpanFilterOption = {
  name?: string | RegExp;
  attributes?: Record<string, AttributeValueOption>;
  resource?: {
    attributes?: Record<string, AttributeValueOption>;
  };
};

export async function waitForSpan(
  res: Response,
  filter: SpanFilterOption,
  options?: WaitOption,
): Promise<Span> {
  const traceId = getTraceIdFromResponse(res);
  if (!traceId) {
    throw new EchoedFatalError(
      "Not having Echoed's property in Response. Not the response of fetch?",
    );
  }

  const port = getServerPortFromEnv();
  if (!port) {
    throw new EchoedFatalError(
      `No Echoed server found. When using Jest, not using reporter? When using Playwright, not using globalSetup?`,
    );
  }

  const fulfilledOptions = fulfillWaitOption(options);
  return waitForSpanForTraceId(port, traceId, filter, fulfilledOptions);
}
