import { Comparable } from "@/comparision/comparable";
import { WaitForSpanEvent } from "@/eventBus/parameter";
import { SpanBus } from "@/eventBus/spanBus";
import { opentelemetry } from "@/generated/otelpbj";
import { HexString } from "@/type/hexString";
import { OtelSpan } from "@/type/otelSpan";
import { SpanFilterOption } from "@/type/spanFilterOption";
import { toHex } from "@/util/byte";

export class WaitForSpanRequest {
  public readonly bus: SpanBus;
  private readonly event: WaitForSpanEvent;

  constructor(bus: SpanBus, event: WaitForSpanEvent) {
    this.bus = bus;
    this.event = event;
  }

  async respondIfMatch(span: OtelSpan): Promise<void> {
    if (!this.matches(span)) return;

    await this.respond(span);
  }

  async respond(span: OtelSpan): Promise<void> {
    await this.bus.emitReceiveSpanEvent(this.wantId, this.traceId, span);
  }

  get traceId(): HexString {
    return new HexString(this.event.hexTraceId);
  }

  private get wantId(): string {
    return this.event.wantId;
  }

  private get filter(): SpanFilterOption {
    return this.event.filter;
  }

  matches(span: OtelSpan): boolean {
    if (!this.traceId.equals(toHex(span.traceId))) return false;

    if (this.filter.name) {
      if (!this.filter.name.matchString(span.name)) return false;
    }

    if (this.filter.attributes) {
      if (!this.matchesAttributes(span.attributes, this.filter.attributes)) {
        return false;
      }
    }

    if (this.filter.resource?.attributes) {
      if (!span.resource) return false;

      if (
        !this.matchesAttributes(
          span.resource.attributes,
          this.filter.resource.attributes,
        )
      ) {
        return false;
      }
    }

    return true;
  }

  private matchesAttributes(
    attributes: opentelemetry.proto.common.v1.IKeyValue[],
    comparables: Record<string, Comparable>,
  ): boolean {
    const matchedKeys = new Set<string>();
    for (const attr of attributes) {
      if (!attr.key) continue;

      const comparable = comparables[attr.key];
      if (!comparable) continue;
      if (!attr.value) continue;

      if (!comparable.matchIAnyValue(attr.value)) continue;
      matchedKeys.add(attr.key);
    }

    return matchedKeys.size === Object.keys(comparables).length;
  }
}
