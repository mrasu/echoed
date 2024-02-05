import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import {
  restoreComparables,
  restoreStringComparable,
} from "@/comparision/restore";
import { IEventBus } from "@/eventBus/infra/iEventBus";
import { Base64String } from "@/type/base64String";
import { jsonSpan } from "@/type/jsonSpan";
import { OtelSpan } from "@/type/otelSpan";
import { Span } from "@/type/span";

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

type jsonWantSpanEvent = {
  base64TraceId: string;
  filter: jsonSpanFilterOption;
  wantId: string;
};

type jsonSpanFilterOption = {
  name?: unknown;
  attributes: Record<string, unknown>;
  resource: {
    attributes: Record<string, unknown>;
  };
};

type jsonReceiveSpanEvent = {
  wantId: string;
  base64TraceId: string;
  span: jsonSpan;
};

export class SpanBus {
  constructor(private readonly bus: IEventBus) {}

  listenWantSpanEvent(callback: (event: WantSpanEvent) => Promise<void>): void {
    this.bus.on(WANT_SPAN_EVENT_NAME, async (data: unknown) => {
      await callback(this.restoreWantSpanEvent(data));
    });
  }

  private restoreWantSpanEvent(origData: unknown): WantSpanEvent {
    const data = origData as jsonWantSpanEvent;
    return {
      base64TraceId: data.base64TraceId,
      filter: this.restoreSpanFilterOption(data.filter),
      wantId: data.wantId,
    };
  }

  private restoreSpanFilterOption(
    data: jsonSpanFilterOption,
  ): SpanFilterOption {
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
      async (data: unknown) => {
        const event = this.restoreReceiveSpanEvent(data);
        if (
          event.wantId === wantId &&
          event.base64TraceId === traceId.base64String
        ) {
          return Promise.resolve(event.span);
        }
        return Promise.resolve(undefined);
      },
    );

    return new Span(span);
  }

  private restoreReceiveSpanEvent(origData: unknown): ReceiveSpanEvent {
    const data = origData as jsonReceiveSpanEvent;
    return {
      wantId: data.wantId,
      base64TraceId: data.base64TraceId,
      span: data.span,
    };
  }

  private async emitWantSpanEvent(event: WantSpanEvent): Promise<void> {
    await this.bus.emit(WANT_SPAN_EVENT_NAME, event);
  }

  async emitReceiveSpanEvent(
    wantId: string,
    traceId: Base64String,
    span: OtelSpan,
  ): Promise<void> {
    const event: ReceiveSpanEmitEvent = {
      wantId,
      base64TraceId: traceId.base64String,
      span,
    };
    await this.bus.emit(RECEIVE_SPAN_EVENT_NAME, event);
  }
}
