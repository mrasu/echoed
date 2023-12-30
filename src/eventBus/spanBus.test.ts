import { SpanBus, SpanFilterOption, WantSpanEvent } from "@/eventBus/spanBus";
import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import { DummyBus } from "@/testUtil/eventBus/dummyBus";
import { jsonSpan } from "@/type/jsonSpan";
import { Span } from "@/type/span";

describe("SpanBus", () => {
  const defaultFilter: SpanFilterOption = {
    name: new Eq("dummyName"),
    attributes: {
      dummyKey: new Eq(1234),
    },
    resource: {
      attributes: {
        dummyResourceKey: new Reg(/abc/i),
      },
    },
  };

  const span = {
    traceId: Uint8Array.from([1, 2, 3]),
    spanId: Uint8Array.from([11, 12, 13]),
    parentSpanId: Uint8Array.from([21, 22, 23]),
    attributes: [],
  };

  describe("listenWantSpanEvent", () => {
    let bus: SpanBus;
    beforeEach(() => {
      const dummyBus = new DummyBus();
      dummyBus.immediateReturnObject = span;
      bus = new SpanBus(dummyBus);
    });

    it("should call callback when event is emitted", async () => {
      const callback = jest.fn();
      bus.listenWantSpanEvent(callback);

      await bus.requestWantSpan("trace-id", defaultFilter, 0);

      const expected: WantSpanEvent = {
        wantId: expect.any(String),
        traceId: "trace-id",
        filter: defaultFilter,
      };
      expect(callback.mock.calls).toStrictEqual([[expected]]);
    });
  });

  describe("requestWantSpan", () => {
    let bus: SpanBus;

    const span: jsonSpan = {
      traceId: "1234",
      spanId: "abcd",
      parentSpanId: "a",
      attributes: [],
    };

    beforeEach(() => {
      const dummyBus = new DummyBus();
      dummyBus.immediateReturnObject = span;

      bus = new SpanBus(dummyBus);
    });

    it("should return Span", async () => {
      const returnedSpan = await bus.requestWantSpan(
        "trace-id",
        defaultFilter,
        0,
      );

      expect(returnedSpan).toStrictEqual(new Span(span));
    });
  });
});
