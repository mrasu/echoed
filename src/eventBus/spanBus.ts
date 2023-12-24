import { FileBus } from "@/eventBus/infra/fileBus";
import { TobikuraSpan } from "@/type/tobikuraSpan";
import { jsonSpan } from "@/type/jsonSpan";

const WANT_SPAN_EVENT_NAME = "wantSpan";
const RECEIVE_SPAN_EVENT_NAME = "receiveSpan";

export type WantSpanEvent = {
  traceId: string;
  filter: SpanFilterOption;
  wantId: string;
};

type ReceiveSpanEvent = {
  wantId: string;
  traceId: string;
  span: jsonSpan;
};

// Span of ReceiveSpanEvent can be TobikuraSpan because TobikuraSpan becomes ISpan after JSON.parse(JSON.stringify)
type ReceiveSpanEmitEvent = Omit<ReceiveSpanEvent, "span"> & {
  span: jsonSpan | TobikuraSpan;
};

export type SpanFilterAttributeOption = {
  [key: string]: string | boolean | number;
};

export type SpanFilterOption = {
  name?: string;
  attributes?: SpanFilterAttributeOption;
  resource?: {
    attributes?: SpanFilterAttributeOption;
  };
};

export class SpanBus {
  constructor(private readonly bus: FileBus) {}

  listenWantSpanEvent(callback: (event: WantSpanEvent) => void) {
    this.bus.on(WANT_SPAN_EVENT_NAME, async (data) => {
      callback(data as WantSpanEvent);
    });
  }

  async requestWantSpan(
    traceId: string,
    filter: SpanFilterOption,
    waitTimeoutMs: number,
  ): Promise<jsonSpan> {
    const wantId = crypto.randomUUID();
    await this.emitWantSpanEvent({
      traceId,
      filter,
      wantId,
    });

    const span = await this.bus.onOnce(
      RECEIVE_SPAN_EVENT_NAME,
      waitTimeoutMs,
      (event: ReceiveSpanEvent) => {
        if (event.wantId === wantId && event.traceId === traceId) {
          return event.span;
        }
        return undefined;
      },
    );

    return span;
  }

  private async emitWantSpanEvent(event: WantSpanEvent) {
    await this.bus.emit(WANT_SPAN_EVENT_NAME, event);
  }

  async emitReceiveSpanEvent(
    wantId: string,
    traceId: string,
    span: TobikuraSpan,
  ) {
    const event: ReceiveSpanEmitEvent = {
      wantId,
      traceId,
      span,
    };
    await this.bus.emit(RECEIVE_SPAN_EVENT_NAME, event);
  }
}
