import { opentelemetry } from "@/generated/otelpbj";
import { OtelTraceController } from "@/server/constroller/otelTraceController";
import { OtelService } from "@/server/service/otelService";
import { OtelLogStore } from "@/server/store/otelLogStore";
import { OtelSpanStore } from "@/server/store/otelSpanStore";
import { WaitForSpanRequestStore } from "@/server/store/waitForSpanRequestStore";
import { buildTraceId } from "@/testUtil/otel/id";
import { toHex } from "@/util/byte";
import { Mutex } from "async-mutex";
import TracesData = opentelemetry.proto.trace.v1.TracesData;

describe("OtelTraceController", () => {
  const createController = (
    spanStore: OtelSpanStore,
    mutex: Mutex,
  ): OtelTraceController => {
    const otelService = new OtelService(
      spanStore,
      new OtelLogStore(),
      new WaitForSpanRequestStore(mutex),
    );

    return new OtelTraceController(otelService);
  };

  describe("post", () => {
    const traceId = buildTraceId();
    const tracesData = new TracesData({
      resourceSpans: [
        {
          resource: {
            attributes: [
              {
                key: "resource-key",
                value: { stringValue: "resource-value" },
              },
            ],
          },
          scopeSpans: [
            {
              scope: {
                name: "my-scope",
              },
              spans: [
                {
                  traceId: traceId.uint8Array,
                },
              ],
            },
          ],
        },
      ],
    });

    it("should record span", async () => {
      const mutex = new Mutex();
      const spanStore = new OtelSpanStore(mutex);
      const controller = createController(spanStore, mutex);

      const body = TracesData.encode(tracesData).finish();
      const res = await controller.post(Buffer.from(body));

      expect(res).toEqual("{}");
      expect(spanStore.capturedSpans.size).toBe(1);

      const capturedTraceId = toHex(
        spanStore.capturedSpans.get(traceId.hexString)!.pop()!.traceId,
      );
      expect(capturedTraceId).toEqual(traceId);
    });
  });
});
