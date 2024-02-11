import { SpanBus, WantSpanEvent } from "@/eventBus/spanBus";
import { opentelemetry } from "@/generated/otelpbj";
import { waitForSpan } from "@/scenario/gen/jest/runner/waitForSpan";
import { DummyBus } from "@/testUtil/eventBus/dummyBus";
import { buildEchoedActContext } from "@/testUtil/scenario/context";
import { setTraceIdToResponse } from "@/traceLoggingFetch";
import { Base64String } from "@/type/base64String";
import { OtelSpan } from "@/type/otelSpan";
import { sleep } from "@/util/async";

describe("waitForSpan", () => {
  const span = new OtelSpan(
    {
      traceId: Uint8Array.from([1, 2, 3]),
      spanId: Uint8Array.from([11, 12, 13]),
      parentSpanId: Uint8Array.from([21, 22, 23]),
      attributes: [
        {
          key: "dummyAttr",
          value: { stringValue: "dummy-value" },
        },
      ],
    },
    new opentelemetry.proto.resource.v1.Resource({
      attributes: [
        {
          key: "dummyResourceAttr",
          value: { stringValue: "dummy-resource-value" },
        },
      ],
    }),
  );

  beforeEach(async () => {
    const bus = new DummyBus();
    await bus.open();

    bus.on("wantSpan", async (e: unknown) => {
      // send back receivedSpan after some delay
      void (async (): Promise<void> => {
        await sleep(10);
        const event = e as WantSpanEvent;
        await new SpanBus(bus).emitReceiveSpanEvent(
          event.wantId,
          new Base64String(event.base64TraceId),
          span,
        );
      })();

      return Promise.resolve();
    });

    globalThis.__ECHOED_BUS__ = bus;
  });

  afterEach(() => {
    globalThis.__ECHOED_BUS__?.close();
    delete globalThis.__ECHOED_BUS__;
  });

  describe("call", () => {
    it("should return span", async () => {
      const response = {} as Response;
      setTraceIdToResponse(response, new Base64String("dummy-trace-id"));
      const filter = {};

      const actual = await waitForSpan(
        buildEchoedActContext(),
        {
          response,
          filter,
        },
        {},
      );

      expect(actual.spanId).toEqual(Uint8Array.from([11, 12, 13]));
      expect(actual.getAttribute("dummyAttr")?.value?.stringValue).toEqual(
        "dummy-value",
      );
      expect(
        actual.resource.getAttribute("dummyResourceAttr")?.value?.stringValue,
      ).toEqual("dummy-resource-value");
    });
  });
});
