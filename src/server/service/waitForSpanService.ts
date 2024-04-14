import { EventBus } from "@/eventBus/infra/eventBus";
import { SpanBus } from "@/eventBus/spanBus";
import { ErrorMessage } from "@/type/common";
import { HexString } from "@/type/hexString";
import { JsonSpan } from "@/type/jsonSpan";
import { SpanFilterOption } from "@/type/spanFilterOption";

export class WaitForSpanService {
  constructor(private bus: EventBus) {}

  async handleWaitForSpanEvent(
    traceId: HexString,
    filter: SpanFilterOption,
    waitTimeoutMs: number,
  ): Promise<JsonSpan | ErrorMessage> {
    const spanBus = new SpanBus(this.bus);
    const response = await spanBus.requestWaitForSpan(
      traceId,
      filter,
      waitTimeoutMs,
    );

    return response;
  }
}
