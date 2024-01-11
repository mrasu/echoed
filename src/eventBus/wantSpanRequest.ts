import { SpanBus, SpanFilterOption, WantSpanEvent } from "@/eventBus/spanBus";
import { OtelSpan } from "@/type/otelSpan";
import { toBase64 } from "@/util/byte";
import { opentelemetry } from "@/generated/otelpbj";
import { Comparable } from "@/comparision/comparable";
import { Base64String } from "@/type/base64String";

export class WantSpanRequest {
  public readonly bus: SpanBus;
  private readonly event: WantSpanEvent;

  constructor(bus: SpanBus, event: WantSpanEvent) {
    this.bus = bus;
    this.event = event;
  }

  async respondIfMatch(span: OtelSpan) {
    if (!this.matches(span)) return;

    await this.respond(span);
  }

  private async respond(span: OtelSpan) {
    await this.bus.emitReceiveSpanEvent(this.wantId, this.traceId, span);
  }

  get traceId(): Base64String {
    return new Base64String(this.event.base64TraceId);
  }

  private get wantId(): string {
    return this.event.wantId;
  }

  private get filter(): SpanFilterOption {
    return this.event.filter;
  }

  private matches(span: OtelSpan): boolean {
    if (!this.traceId.equals(toBase64(span.traceId))) return false;

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
