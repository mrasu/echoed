import { OtelSpan } from "@/type/otelSpan";
import { jsonSpan } from "@/type/jsonSpan";
import { Comparable } from "@/comparision/comparable";
import {
  restoreComparables,
  restoreStringComparable,
} from "@/comparision/restore";
import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import { IEventBus } from "@/eventBus/infra/iEventBus";
import { Span } from "@/type/span";
import { Base64String } from "@/type/base64String";

const WANT_SPAN_EVENT_NAME = "wantSpan";
const RECEIVE_SPAN_EVENT_NAME = "receiveSpan";

export type WantSpanEvent = {
  base64TraceId: string;
  filter: SpanFilterOption;
  wantId: string;
};

type ReceiveSpanEvent = {
  wantId: string;
  base64TraceId: string;
  span: jsonSpan;
};

// Span of ReceiveSpanEvent can be OtelSpan because OtelSpan becomes ISpan after JSON.parse(JSON.stringify)
type ReceiveSpanEmitEvent = Omit<ReceiveSpanEvent, "span"> & {
  span: jsonSpan | OtelSpan;
};

export type SpanFilterOption = {
  name?: Eq | Reg;
  // Use Record instead of Map because JSON.stringify doesn't serialize Map.
  //  e.g. JSON.stringify(new Map([["a",1]])) returns {} insteadof {"a":1}
  attributes: Record<string, Comparable>;
  resource: {
    attributes: Record<string, Comparable>;
  };
};

export class SpanBus {
  constructor(private readonly bus: IEventBus) {}

  listenWantSpanEvent(callback: (event: WantSpanEvent) => void) {
    this.bus.on(WANT_SPAN_EVENT_NAME, async (data) => {
      callback(this.restoreWantSpanEvent(data));
    });
  }

  private restoreWantSpanEvent(data: any): WantSpanEvent {
    return {
      base64TraceId: data.base64TraceId,
      filter: this.restoreSpanFilterOption(data.filter),
      wantId: data.wantId,
    };
  }

  private restoreSpanFilterOption(data: any): SpanFilterOption {
    return {
      name: restoreStringComparable(data.name),
      attributes: restoreComparables(data.attributes),
      resource: {
        attributes: restoreComparables(data.resource?.attributes),
      },
    };
  }

  async requestWantSpan(
    traceId: Base64String,
    filter: SpanFilterOption,
    waitTimeoutMs: number,
  ): Promise<Span> {
    const wantId = crypto.randomUUID();
    await this.emitWantSpanEvent({
      base64TraceId: traceId.base64String,
      filter,
      wantId,
    });

    const span = await this.bus.onOnce(
      RECEIVE_SPAN_EVENT_NAME,
      waitTimeoutMs,
      (data: unknown) => {
        const event = this.restoreReceiveSpanEvent(data);
        if (
          event.wantId === wantId &&
          event.base64TraceId === traceId.base64String
        ) {
          return event.span;
        }
        return undefined;
      },
    );

    return new Span(span);
  }

  private restoreReceiveSpanEvent(data: any): ReceiveSpanEvent {
    return {
      wantId: data.wantId,
      base64TraceId: data.base64TraceId,
      span: data.span,
    };
  }

  private async emitWantSpanEvent(event: WantSpanEvent) {
    await this.bus.emit(WANT_SPAN_EVENT_NAME, event);
  }

  async emitReceiveSpanEvent(
    wantId: string,
    traceId: Base64String,
    span: OtelSpan,
  ) {
    const event: ReceiveSpanEmitEvent = {
      wantId,
      base64TraceId: traceId.base64String,
      span,
    };
    await this.bus.emit(RECEIVE_SPAN_EVENT_NAME, event);
  }
}
