import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import { SpanBus, SpanFilterOption, WantSpanEvent } from "@/eventBus/spanBus";
import { DummyBus } from "@/testUtil/eventBus/dummyBus";
import { Base64String } from "@/type/base64String";

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
    let bus: SpanBus;
    beforeEach(async () => {
      const mockBus = new DummyBus();
      await mockBus.open();
      bus = new SpanBus(mockBus);
    });

    it("should call callback when event is emitted", async () => {
      const callback = jest.fn();
      bus.listenWantSpanEvent(callback);

      await expect(async () => {
        await bus.requestWantSpan(
          new Base64String("trace-id"),
          defaultFilter,
          0,
        );
      }).rejects.toThrow("timeout");

      const expected: WantSpanEvent = {
        wantId: expect.any(String) as string,
        base64TraceId: "trace-id",
        filter: defaultFilter,
      };
      expect(callback.mock.calls).toStrictEqual([[expected]]);
    });
  });

  describe("requestWantSpan", () => {
    let bus: SpanBus;
    let mockBus: DummyBus<WantSpanEvent>;

    beforeEach(async () => {
      mockBus = new DummyBus();
      await mockBus.open();

      bus = new SpanBus(mockBus);
    });

    it("should emit request", async () => {
      await expect(async () => {
        await bus.requestWantSpan(
          new Base64String("trace-id"),
          defaultFilter,
          0,
        );
      }).rejects.toThrow("timeout");

      const emittedData = mockBus.emittedData();
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].data.base64TraceId).toBe("trace-id");
      expect(emittedData[0].data.filter).toStrictEqual({
        name: new Eq("dummyName").toJSON(),
        attributes: {
          dummyKey: new Eq(1234).toJSON(),
        },
        resource: {
          attributes: {
            dummyResourceKey: new Reg(/abc/i).toJSON(),
          },
        },
      });
    });
  });
});
