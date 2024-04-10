import { EventBus } from "@/eventBus/infra/eventBus";
import { SpanBus } from "@/eventBus/spanBus";
import { Base64String } from "@/type/base64String";
import { ErrorMessage } from "@/type/common";
import { JsonSpan } from "@/type/jsonSpan";
import { SpanFilterOption } from "@/type/spanFilterOption";

export class WaitForSpanService {
  constructor(private bus: EventBus) {}

  async handleWaitForSpanEvent(
    traceId: Base64String,
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
