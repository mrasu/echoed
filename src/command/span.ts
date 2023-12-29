import { SpanBus } from "@/eventBus/spanBus";
import { traceIdPropertyName } from "@/traceLoggingFetch";
import { Span } from "@/type/span";
import { Compare } from "@/command/compare";
import { convertSpanFilterOption } from "@/command/bridge/compare";

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
  const bus = globalThis.__TOBIKURA_BUS__;
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
    convertSpanFilterOption(filter),
    options?.timeoutMs ?? 10000,
  );

  return new Span(span);
}
