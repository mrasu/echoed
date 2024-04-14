import { EventBus } from "@/eventBus/infra/eventBus";
import { SpanBus } from "@/eventBus/spanBus";
import { WaitForSpanRequest } from "@/eventBus/waitForSpanRequest";
import { OtelSpanStore } from "@/server/store/otelSpanStore";
import { WaitForSpanRequestStore } from "@/server/store/waitForSpanRequestStore";
import { OtelSpan } from "@/type/otelSpan";

export class ServerSpanBus {
  static startListening(
    bus: EventBus,
    otelSpanStore: OtelSpanStore,
    waitForSpanRequestStore: WaitForSpanRequestStore,
  ): void {
    const serverSpanBus = new ServerSpanBus(
      bus,
      otelSpanStore,
      waitForSpanRequestStore,
    );

    serverSpanBus.startBus();
  }

  constructor(
    private bus: EventBus,
    private otelSpanStore: OtelSpanStore,
    private waitForSpanRequestStore: WaitForSpanRequestStore,
  ) {}

  private startBus(): void {
    const spanBus = new SpanBus(this.bus);
    spanBus.listenWaitForSpanEvent(async (data) => {
      const request = new WaitForSpanRequest(spanBus, data);
      await this.handleWaitForSpanRequest(request);
    });
  }

  private async handleWaitForSpanRequest(
    request: WaitForSpanRequest,
  ): Promise<void> {
    const hexTraceId = request.traceId.hexString;

    let spans: OtelSpan[] | undefined = [];
    await this.waitForSpanRequestStore.update(hexTraceId, (requests) => {
      spans = this.otelSpanStore.getCaptured(hexTraceId);

      requests.push(request);
      return requests;
    });

    if (!spans) return;

    for (const span of spans) {
      await request.respondIfMatch(span);
    }
  }
}
