import { MemoryBus } from "@/eventBus/infra/memoryBus";
import { WaitForSpanEvent } from "@/eventBus/parameter";
import { SpanBus } from "@/eventBus/spanBus";
import { WaitForSpanRequest } from "@/eventBus/waitForSpanRequest";
import { WaitForSpanService } from "@/server/service/waitForSpanService";
import { buildSpanId, buildTraceId } from "@/testUtil/otel/id";
import { OtelSpan } from "@/type/otelSpan";

describe("waitForSpanService", () => {
  describe("handleWaitForSpanEvent", () => {
    describe("when span found", () => {
      const traceId = buildTraceId();

      const filter = {
        attributes: {},
        resource: {
          attributes: {},
        },
      };

      it("should return span", async () => {
        const bus = new MemoryBus();
        const service = new WaitForSpanService(bus);

        const spanName = "test-span-name";

        const spanBus = new SpanBus(bus);
        spanBus.listenWaitForSpanEvent(
          async (event: WaitForSpanEvent): Promise<void> => {
            const request = new WaitForSpanRequest(spanBus, event);

            await request.respond(
              new OtelSpan({
                name: spanName,
                traceId: traceId.uint8Array,
                parentSpanId: buildSpanId().uint8Array,
                spanId: buildSpanId().uint8Array,
              }),
            );
          },
        );

        const res = await service.handleWaitForSpanEvent(traceId, filter, 0);

        expect("name" in res).toBe(true);
        if ("name" in res) {
          expect(res.name).toBe(spanName);
        } else {
          throw new Error("unexpected path");
        }
      });
    });

    describe("when span not found", () => {
      const traceId = buildTraceId();

      const filter = {
        attributes: {},
        resource: {
          attributes: {},
        },
      };

      it("should return span", async () => {
        const bus = new MemoryBus();
        const service = new WaitForSpanService(bus);

        const res = await service.handleWaitForSpanEvent(traceId, filter, 0);

        expect("reason" in res).toBe(true);
        if ("reason" in res) {
          expect(res.reason).toBe("timeout");
        } else {
          throw new Error("unexpected path");
        }
      });
    });
  });
});
