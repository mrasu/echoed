import { WantSpanEvent } from "@/eventBus/spanBus";
import { waitForSpan } from "@/scenario/gen/jest/runner/waitForSpan";
import { DummyBus } from "@/testUtil/eventBus/dummyBus";
import { buildEchoedActContext } from "@/testUtil/scenario/context";
import { setTraceIdToResponse } from "@/traceLoggingFetch";
import { Base64String } from "@/type/base64String";

describe("waitForSpan", () => {
  const span = {
    traceId: Uint8Array.from([1, 2, 3]),
    spanId: Uint8Array.from([11, 12, 13]),
    parentSpanId: Uint8Array.from([21, 22, 23]),
    attributes: [
      {
        key: "dummyAttr",
        value: { stringValue: "dummy-value" },
      },
    ],
    resource: {
      attributes: [
        {
          key: "dummyResourceAttr",
          value: { stringValue: "dummy-resource-value" },
        },
      ],
    },
  };

  let bus: DummyBus<WantSpanEvent>;
  beforeEach(() => {
    bus = new DummyBus();
    bus.immediateReturnObject = span;
    globalThis.__ECHOED_BUS__ = bus;
  });

  afterEach(() => {
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
