import { EventBus } from "@/eventBus/infra/eventBus";
import {
  JsonReceiveSpanEvent,
  JsonWaitForSpanEvent,
  ReceiveSpanEmitEvent,
  WaitForSpanEvent,
  restoreReceiveSpanEvent,
  restoreWaitForSpanEvent,
} from "@/eventBus/parameter";
import { ErrorMessage } from "@/type/common";
import { HexString } from "@/type/hexString";
import { JsonSpan } from "@/type/jsonSpan";
import { OtelSpan } from "@/type/otelSpan";
import { SpanFilterOption } from "@/type/spanFilterOption";
import { buildRandomHexUUID } from "@/util/random";

export const WAIT_FOR_SPAN_EVENT_NAME = "waitForSpan";
export const RECEIVE_SPAN_EVENT_NAME = "receiveSpan";

export class SpanBus {
  constructor(private readonly bus: EventBus) {}

  listenWaitForSpanEvent(
    callback: (event: WaitForSpanEvent) => Promise<void>,
  ): void {
    this.bus.on(WAIT_FOR_SPAN_EVENT_NAME, async (origData: unknown) => {
      const data = JsonWaitForSpanEvent.parse(origData);
      await callback(restoreWaitForSpanEvent(data));
    });
  }

  async requestWaitForSpan(
    traceId: HexString,
    filter: SpanFilterOption,
    waitTimeoutMs: number,
  ): Promise<JsonSpan | ErrorMessage> {
    const wantId = buildRandomHexUUID();

    const listener = this.bus.onOnce(
      RECEIVE_SPAN_EVENT_NAME,
      waitTimeoutMs,
      async (origData: unknown) => {
        const data = JsonReceiveSpanEvent.parse(origData);
        const event = restoreReceiveSpanEvent(data);
        if (event.wantId === wantId && event.hexTraceId === traceId.hexString) {
          return Promise.resolve(event.span);
        }
        return Promise.resolve(undefined);
      },
    );
    await this.emitWaitForSpanEvent({
      hexTraceId: traceId.hexString,
      filter,
      wantId,
    });
    const span = await listener;

    return span;
  }

  private async emitWaitForSpanEvent(event: WaitForSpanEvent): Promise<void> {
    await this.bus.emit(WAIT_FOR_SPAN_EVENT_NAME, event);
  }

  async emitReceiveSpanEvent(
    wantId: string,
    traceId: HexString,
    span: OtelSpan,
  ): Promise<void> {
    const event: ReceiveSpanEmitEvent = {
      wantId,
      hexTraceId: traceId.hexString,
      span,
    };
    await this.bus.emit(RECEIVE_SPAN_EVENT_NAME, event);
  }
}
