import { SpanBus, SpanFilterOption } from "@/eventBus/spanBus";
import { traceIdPropertyName } from "@/traceLoggingFetch";
import { Span } from "@/type/span";

export type WaitOption = {
  timeoutMs?: number;
};

export async function waitForSpan(
  res: Response,
  filter: SpanFilterOption,
  options?: WaitOption,
): Promise<Span> {
  const bus = globalThis.__BUS__;
  if (!bus) throw new Error("No bus for tobikura. not using reporter?");

  const traceId = (res as any)[traceIdPropertyName];
  if (!traceId) {
    throw new Error(
      "Not having tobikura's property in Response. Not the response of fetch?",
    );
  }

  const spanBus = new SpanBus(bus);
  const span = await spanBus.requestWantSpan(
    traceId,
    filter,
    options?.timeoutMs || 10000,
  );

  return new Span(span);
}
