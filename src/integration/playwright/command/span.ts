import { waitForSpanForTraceId as bridgeWaitForSpanForTraceId } from "@/command/bridge/span";
import { SpanFilterOption, WaitOption } from "@/command/span";
import { Span } from "@/command/spanType";
import { EchoedFatalError } from "@/echoedFatalError";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { getTraceIdFromAPIResponse } from "@/integration/playwright/internal/util/apiResponse";
import { getLastTraceIdFromContext } from "@/integration/playwright/internal/util/browserContext";
import { newBus } from "@/integration/playwright/internal/util/eventBus";
import { Base64String } from "@/type/base64String";
import { APIResponse, BrowserContext } from "@playwright/test";

export async function waitForSpanCreatedIn(
  context: BrowserContext,
  urlPattern: string | RegExp,
  filter: SpanFilterOption,
  options?: WaitOption,
): Promise<Span> {
  const traceId = getLastTraceIdFromContext(context, urlPattern);
  if (!traceId) {
    throw new EchoedFatalError(
      `Not match any executed url. not using test produced by Echoed? urlPattern: ${urlPattern}`,
    );
  }

  return await waitForSpanForTraceId(traceId, filter, options);
}

export async function waitForSpanFromPlaywrightFetch(
  fetchResponse: APIResponse,
  filter: SpanFilterOption,
  options?: WaitOption,
): Promise<Span> {
  const traceId = getTraceIdFromAPIResponse(fetchResponse);
  if (!traceId) {
    throw new EchoedFatalError(
      "Not having Echoed's property in Response. Not the response from BrowserContext.request?",
    );
  }

  return await waitForSpanForTraceId(traceId, filter, options);
}

async function waitForSpanForTraceId(
  traceId: Base64String,
  filter: SpanFilterOption,
  options?: WaitOption,
): Promise<Span> {
  const fsContainer = buildFsContainerForApp();
  const bus = newBus(fsContainer, false);

  await bus.open();
  const span = await bridgeWaitForSpanForTraceId(
    bus,
    traceId,
    filter,
    options,
  ).finally(() => {
    bus.close();
  });

  return span;
}
