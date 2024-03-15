import { waitForSpanForTraceId } from "@/command/bridge/span";
import { Compare } from "@/command/compare";
import { Span } from "@/command/spanType";
import { EchoedFatalError } from "@/echoedFatalError";
import { EventBus } from "@/eventBus/infra/eventBus";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { newBus } from "@/integration/playwright/internal/util/eventBus";
import { getTraceIdFromResponse } from "@/traceLoggingFetch";

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

  let bus = globalThis.__ECHOED_BUS__;
  let busStartedHere = false;
  if (!bus) {
    const busForPlaywright = createBusForPlaywright();

    busStartedHere = true;
    bus = busForPlaywright;
    await bus.open();
  }

  try {
    return await waitForSpanForTraceId(bus, traceId, filter, options);
  } finally {
    if (busStartedHere) {
      bus.close();
    }
  }
}

function createBusForPlaywright(): EventBus {
  const fsContainer = buildFsContainerForApp();
  try {
    return newBus(fsContainer, true);
  } catch (e) {
    if (e instanceof EchoedFatalError) {
      throw new EchoedFatalError(
        `No bus for Echoed. When using Jest, not using reporter? When using Playwright, ${e.origMsg}`,
      );
    }
    throw e;
  }
}
