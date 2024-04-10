import { opentelemetry } from "@/generated/otelpbj";
import { NoResponse } from "@/server/parameter/commonParameter";
import { OtelService } from "@/server/service/otelService";
import TracesData = opentelemetry.proto.trace.v1.TracesData;

export class OtelTraceController {
  constructor(private otelService: OtelService) {}

  async post(body: Buffer): Promise<NoResponse> {
    const tracesData = TracesData.decode(body);
    await this.otelService.handleOtelTraces(tracesData);

    return NoResponse;
  }
}
