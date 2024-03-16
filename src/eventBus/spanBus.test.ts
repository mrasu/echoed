import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import { EventBus } from "@/eventBus/infra/eventBus";
import { WantSpanEvent } from "@/eventBus/parameter";
import { SpanBus } from "@/eventBus/spanBus";
import { Base64String } from "@/type/base64String";
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

  describe("listenWantSpanEvent", () => {
    let bus: MockProxy<EventBus>;
    let spanBus: SpanBus;
    beforeEach(() => {
      bus = mock<EventBus>();
      spanBus = new SpanBus(bus);
    });

    it("should call callback when event is emitted", async () => {
      const callback = jest.fn();
      spanBus.listenWantSpanEvent(callback);

      await spanBus.requestWantSpan(
        new Base64String("trace-id"),
        defaultFilter,
        0,
      );

      const expected: WantSpanEvent = {
        wantId: expect.any(String) as string,
        base64TraceId: "trace-id",
        filter: defaultFilter,
      };
      expect(bus.emit.mock.calls[0][1]).toEqual(expected);
    });
  });

  describe("requestWantSpan", () => {
    let bus: SpanBus;
    let mockBus: MockProxy<EventBus>;

    beforeEach(() => {
      mockBus = mock<EventBus>();
      bus = new SpanBus(mockBus);
    });

    it("should emit request", async () => {
      await bus.requestWantSpan(new Base64String("trace-id"), defaultFilter, 0);

      const emittedData = mockBus.emit.mock.calls;
      expect(emittedData.length).toBe(1);
      expect(emittedData[0][1]).toEqual({
        base64TraceId: "trace-id",
        filter: defaultFilter,
        wantId: expect.any(String) as string,
      });
    });
  });
});
