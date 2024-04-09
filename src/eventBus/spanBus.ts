import { EventBus } from "@/eventBus/infra/eventBus";
import {
  JsonReceiveSpanEvent,
  JsonWantSpanEvent,
  ReceiveSpanEmitEvent,
  WantSpanEvent,
  restoreReceiveSpanEvent,
  restoreWantSpanEvent,
} from "@/eventBus/parameter";
import { Base64String } from "@/type/base64String";
import { ErrorMessage } from "@/type/common";
import { JsonSpan } from "@/type/jsonSpan";
import { OtelSpan } from "@/type/otelSpan";
import { SpanFilterOption } from "@/type/spanFilterOption";
import { buildRandomHexUUID } from "@/util/random";

export const WANT_SPAN_EVENT_NAME = "wantSpan";
export const RECEIVE_SPAN_EVENT_NAME = "receiveSpan";

export class SpanBus {
  constructor(private readonly bus: EventBus) {}

  listenWantSpanEvent(callback: (event: WantSpanEvent) => Promise<void>): void {
    this.bus.on(WANT_SPAN_EVENT_NAME, async (origData: unknown) => {
      const data = JsonWantSpanEvent.parse(origData);
      await callback(restoreWantSpanEvent(data));
    });
  }

  async requestWantSpan(
    traceId: Base64String,
    filter: SpanFilterOption,
    waitTimeoutMs: number,
  ): Promise<JsonSpan | ErrorMessage> {
    const wantId = buildRandomHexUUID();
    await this.emitWantSpanEvent({
      base64TraceId: traceId.base64String,
      filter,
      wantId,
    });

    const span = await this.bus.onOnce(
      RECEIVE_SPAN_EVENT_NAME,
      waitTimeoutMs,
      async (origData: unknown) => {
        const data = JsonReceiveSpanEvent.parse(origData);
        const event = restoreReceiveSpanEvent(data);
        if (
          event.wantId === wantId &&
          event.base64TraceId === traceId.base64String
        ) {
          return Promise.resolve(event.span);
        }
        return Promise.resolve(undefined);
      },
    );

    return span;
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
