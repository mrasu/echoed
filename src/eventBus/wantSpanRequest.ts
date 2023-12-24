import {
  SpanBus,
  SpanFilterAttributeOption,
  SpanFilterOption,
  WantSpanEvent,
} from "@/eventBus/spanBus";
import { TobikuraSpan } from "@/type/tobikuraSpan";
import { toBase64 } from "@/util/byte";
import { opentelemetry } from "@/generated/otelpbj";
import { matchAttributeValue } from "@/util/span";

export class WantSpanRequest {
  public readonly bus: SpanBus;
  private readonly event: WantSpanEvent;

  constructor(bus: SpanBus, event: WantSpanEvent) {
    this.bus = bus;
    this.event = event;
  }

  async respondIfMatch(span: TobikuraSpan) {
    if (!this.matches(span)) return;

    await this.respond(span);
  }

  private async respond(span: TobikuraSpan) {
    await this.bus.emitReceiveSpanEvent(this.wantId, this.traceId, span);
  }

  get traceId(): string {
    return this.event.traceId;
  }

  private get wantId(): string {
    return this.event.wantId;
  }

  private get filter(): SpanFilterOption {
    return this.event.filter;
  }

  private matches(span: TobikuraSpan): boolean {
    if (this.traceId !== toBase64(span.traceId)) return false;

    if (this.filter.name) {
      if (this.filter.name !== span.name) return false;
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
    filterAttributes: SpanFilterAttributeOption,
  ): boolean {
    const matchedKeys = new Set<string>();
    for (const attr of attributes) {
      if (!attr.key) continue;

      const filterValue = filterAttributes[attr.key];
      if (!filterValue) continue;

      if (!matchAttributeValue(attr.value, filterValue)) continue;
      matchedKeys.add(attr.key);
    }

    return matchedKeys.size === Object.keys(filterAttributes).length;
  }
}
