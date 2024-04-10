import { opentelemetry } from "@/generated/otelpbj";
import { NoResponse } from "@/server/parameter/commonParameter";
import { OtelService } from "@/server/service/otelService";
import LogsData = opentelemetry.proto.logs.v1.LogsData;

export class OtelLogController {
  constructor(private otelService: OtelService) {}

  async post(body: Buffer): Promise<NoResponse> {
    const logsData = LogsData.decode(body);
    await this.otelService.handleOtelLogs(logsData);

    return NoResponse;
  }
}
