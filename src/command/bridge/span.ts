import { convertSpanFilterOption } from "@/command/bridge/compare";
import { SpanFilterOption, WaitOption } from "@/command/span";
import { Span } from "@/command/spanType";
import { EventBus } from "@/eventBus/infra/eventBus";
import { SpanBus } from "@/eventBus/spanBus";
import { Base64String } from "@/type/base64String";

const DEFAULT_TIMEOUT_MS = 10000;

export async function waitForSpanForTraceId(
  bus: EventBus,
  traceId: Base64String,
  filter: SpanFilterOption,
  options?: WaitOption,
): Promise<Span> {
  const spanBus = new SpanBus(bus);
  const span = await spanBus.requestWantSpan(
    traceId,
    convertSpanFilterOption(filter),
    options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  return span;
}
