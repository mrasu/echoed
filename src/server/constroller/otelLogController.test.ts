import { opentelemetry } from "@/generated/otelpbj";
import { OtelLogController } from "@/server/constroller/otelLogController";
import { OtelService } from "@/server/service/otelService";
import { OtelLogStore } from "@/server/store/otelLogStore";
import { OtelSpanStore } from "@/server/store/otelSpanStore";
import { WaitForSpanRequestStore } from "@/server/store/waitForSpanRequestStore";
import { buildTraceId } from "@/testUtil/otel/id";
import { toHex } from "@/util/byte";
import { Mutex } from "async-mutex";
import LogsData = opentelemetry.proto.logs.v1.LogsData;

describe("OtelLogController", () => {
  const createController = (logStore: OtelLogStore): OtelLogController => {
    const mutex = new Mutex();
    const otelService = new OtelService(
      new OtelSpanStore(mutex),
      logStore,
      new WaitForSpanRequestStore(mutex),
    );

    return new OtelLogController(otelService);
  };

  describe("post", () => {
    const traceId = buildTraceId();
    const logsData = new LogsData({
      resourceLogs: [
        {
          resource: {
            attributes: [
              {
                key: "resource-key",
                value: { stringValue: "resource-value" },
              },
            ],
          },
          scopeLogs: [
            {
              scope: {
                name: "my-scope",
              },
              logRecords: [
                {
                  traceId: traceId.uint8Array,
                },
              ],
            },
          ],
        },
      ],
    });

    it("should record log", async () => {
      const logStore = new OtelLogStore();
      const controller = createController(logStore);

      const body = LogsData.encode(logsData).finish();
      const res = await controller.post(Buffer.from(body));

      expect(res).toEqual("{}");
      expect(logStore.capturedLogs.size).toBe(1);

      const tt = toHex(
        logStore.capturedLogs.get(traceId.hexString)!.pop()!.traceId,
      );
      expect(tt).toEqual(traceId);
    });
  });
});
