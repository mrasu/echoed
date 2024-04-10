import { MemoryBus } from "@/eventBus/infra/memoryBus";
import { WaitForSpanEvent } from "@/eventBus/parameter";
import { SpanBus } from "@/eventBus/spanBus";
import { WaitForSpanRequest } from "@/eventBus/waitForSpanRequest";
import { WaitForSpanRequestStore } from "@/server/store/waitForSpanRequestStore";
import { buildTraceId } from "@/testUtil/otel/id";
import { Mutex } from "async-mutex";

describe("WaitForSpanRequestStore", () => {
  describe("update", () => {
    const traceId = buildTraceId();
    const event: WaitForSpanEvent = {
      base64TraceId: traceId.base64String,
      wantId: "",
      filter: {
        attributes: {},
        resource: {
          attributes: {},
        },
      },
    };

    describe("when no request exists", () => {
      it("should pass empty array", async () => {
        const store = new WaitForSpanRequestStore(new Mutex());
        const spanBus = new SpanBus(new MemoryBus());

        const request = new WaitForSpanRequest(spanBus, event);
        let found: WaitForSpanRequest[] = [];
        await store.update(traceId.base64String, (requests) => {
          found = requests;
          return [...requests, request];
        });

        expect(found).toEqual([]);
      });
    });

    describe("when request exists", () => {
      it("should pass existings", async () => {
        const store = new WaitForSpanRequestStore(new Mutex());
        const spanBus = new SpanBus(new MemoryBus());

        const request = new WaitForSpanRequest(spanBus, event);
        const existings: WaitForSpanRequest[] = [request];
        await store.update(traceId.base64String, () => {
          return existings;
        });

        let found: WaitForSpanRequest[] = [request];
        await store.update(traceId.base64String, (requests) => {
          found = requests;
          return existings;
        });

        expect(found).toEqual(existings);
      });
    });
  });
});
