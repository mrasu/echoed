import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import { EventBus } from "@/eventBus/infra/eventBus";
import { WaitForSpanEvent } from "@/eventBus/parameter";
import { SpanBus } from "@/eventBus/spanBus";
import { HexString } from "@/type/hexString";
import { SpanFilterOption } from "@/type/spanFilterOption";
import { mock } from "jest-mock-extended";
import { MockProxy } from "jest-mock-extended/lib/Mock";

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

  describe("listenWaitForSpanEvent", () => {
    let bus: MockProxy<EventBus>;
    let spanBus: SpanBus;
    beforeEach(() => {
      bus = mock<EventBus>();
      spanBus = new SpanBus(bus);
    });

    it("should call callback when event is emitted", async () => {
      const callback = jest.fn();
      spanBus.listenWaitForSpanEvent(callback);

      await spanBus.requestWaitForSpan(
        new HexString("trace-id"),
        defaultFilter,
        0,
      );

      const expected: WaitForSpanEvent = {
        wantId: expect.any(String) as string,
        hexTraceId: "trace-id",
        filter: defaultFilter,
      };
      expect(bus.emit.mock.calls[0][1]).toEqual(expected);
    });
  });

  describe("requestWaitForSpan", () => {
    let bus: SpanBus;
    let mockBus: MockProxy<EventBus>;

    beforeEach(() => {
      mockBus = mock<EventBus>();
      bus = new SpanBus(mockBus);
    });

    it("should emit request", async () => {
      await bus.requestWaitForSpan(new HexString("trace-id"), defaultFilter, 0);

      const emittedData = mockBus.emit.mock.calls;
      expect(emittedData.length).toBe(1);
      expect(emittedData[0][1]).toEqual({
        hexTraceId: "trace-id",
        filter: defaultFilter,
        wantId: expect.any(String) as string,
      });
    });
  });
});
