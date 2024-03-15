import { waitForSpanForTraceId } from "@/command/bridge/span";
import { eq, gt, gte, lt, lte } from "@/command/compare";
import { Eq } from "@/comparision/eq";
import { Gt } from "@/comparision/gt";
import { Gte } from "@/comparision/gte";
import { Lt } from "@/comparision/lt";
import { Lte } from "@/comparision/lte";
import { Reg } from "@/comparision/reg";
import { WantSpanEvent } from "@/eventBus/spanBus";
import { DummyBus } from "@/testUtil/eventBus/dummyBus";
import { Base64String } from "@/type/base64String";

describe("waitForSpanForTraceId", () => {
  const traceId = new Base64String("dummy-trace-id");

  let bus: DummyBus<WantSpanEvent>;
  beforeEach(async () => {
    bus = new DummyBus();
    await bus.open();
  });

  afterEach(() => {
    bus.close();
  });

  describe("when filtering by name", () => {
    it("should emit data to Bus with filtered by name", async () => {
      await expect(async () => {
        await waitForSpanForTraceId(
          bus,
          traceId,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow("timeout");

      const emittedData = bus.emittedData();
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].data.base64TraceId).toBe("dummy-trace-id");
      expect(emittedData[0].data.filter).toStrictEqual({
        name: new Eq("dummy/name").toJSON(),
        attributes: {},
        resource: {
          attributes: {},
        },
      });
    });
  });

  describe("when filtering by attributes", () => {
    it("should emit data to Bus with filtered by attributes", async () => {
      await expect(async () => {
        await waitForSpanForTraceId(
          bus,
          traceId,
          {
            attributes: {
              dummyStr: "dummy-value",
              dummyReg: /abc/i,
            },
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow("timeout");

      const emittedData = bus.emittedData();
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].data.base64TraceId).toBe("dummy-trace-id");
      expect(emittedData[0].data.filter).toStrictEqual({
        attributes: {
          dummyStr: new Eq("dummy-value").toJSON(),
          dummyReg: new Reg(/abc/i).toJSON(),
        },
        resource: {
          attributes: {},
        },
      });
    });
  });

  describe("when filtering by resource's attributes", () => {
    it("should emit data to Bus with filtered by resource's attributes", async () => {
      await expect(async () => {
        await waitForSpanForTraceId(
          bus,
          traceId,
          {
            resource: {
              attributes: {
                dummyStr: "dummy-value",
                dummyReg: /abc/i,
              },
            },
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow("timeout");

      const emittedData = bus.emittedData();
      expect(emittedData.length).toBe(1);
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].data.base64TraceId).toBe("dummy-trace-id");
      expect(emittedData[0].data.filter).toStrictEqual({
        attributes: {},
        resource: {
          attributes: {
            dummyStr: new Eq("dummy-value").toJSON(),
            dummyReg: new Reg(/abc/i).toJSON(),
          },
        },
      });
    });
  });

  describe("when using eq", () => {
    it("should emit data to Bus with eq filter", async () => {
      await expect(async () => {
        await waitForSpanForTraceId(
          bus,
          traceId,
          {
            attributes: {
              key: eq("value"),
            },
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow("timeout");

      const emittedData = bus.emittedData();
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].data.filter).toStrictEqual({
        attributes: {
          key: new Eq("value").toJSON(),
        },
        resource: {
          attributes: {},
        },
      });
    });
  });

  describe("when using RegExp", () => {
    it("should emit data to Bus with Reg filter", async () => {
      await expect(async () => {
        await waitForSpanForTraceId(
          bus,
          traceId,
          {
            attributes: {
              key: /abc/i,
            },
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow("timeout");

      const emittedData = bus.emittedData();
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].data.filter).toStrictEqual({
        attributes: {
          key: new Reg(/abc/i).toJSON(),
        },
        resource: {
          attributes: {},
        },
      });
    });
  });

  describe("when using number comparator", () => {
    it("should emit data to Bus with number comparison filter", async () => {
      await expect(async () => {
        await waitForSpanForTraceId(
          bus,
          traceId,
          {
            attributes: {
              keyGt: gt(1),
              keyGte: gte(2),
              keyLt: lt(3),
              keyLte: lte(4),
            },
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow("timeout");

      const emittedData = bus.emittedData();
      expect(emittedData.length).toBe(1);
      expect(emittedData[0].data.filter).toStrictEqual({
        attributes: {
          keyGt: new Gt(1).toJSON(),
          keyGte: new Gte(2).toJSON(),
          keyLt: new Lt(3).toJSON(),
          keyLte: new Lte(4).toJSON(),
        },
        resource: {
          attributes: {},
        },
      });
    });
  });
});
