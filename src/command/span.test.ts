import { waitForSpan } from "@/command/span";
import { setTraceIdToResponse } from "@/traceLoggingFetch";
import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import { eq, gt, gte, lt, lte } from "@/command/compare";
import { Gte } from "@/comparision/gte";
import { Lte } from "@/comparision/lte";
import { Lt } from "@/comparision/lt";
import { Gt } from "@/comparision/gt";
import { DummyBus } from "@/testUtil/eventBus/dummyBus";
import { Base64String } from "@/type/base64String";
import { WantSpanEvent } from "@/eventBus/spanBus";

describe("waitForSpan", () => {
  const span = {
    traceId: Uint8Array.from([1, 2, 3]),
    spanId: Uint8Array.from([11, 12, 13]),
    parentSpanId: Uint8Array.from([21, 22, 23]),
    attributes: [],
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

  const buildResponse = (traceId: Base64String) => {
    const res = {} as Response;
    setTraceIdToResponse(res, traceId);
    return res;
  };

  describe("when filtering by name", () => {
    it("should emit data to Bus with filtered by name", async () => {
      const res = buildResponse(new Base64String("dummy-trace-id"));
      await waitForSpan(
        res,
        {
          name: "dummy/name",
        },
        { timeoutMs: 0 },
      );

      expect(bus.emittedData.length).toBe(1);
      expect(bus.emittedData[0][1].base64TraceId).toBe("dummy-trace-id");
      expect(bus.emittedData[0][1].filter).toStrictEqual({
        name: new Eq("dummy/name"),
        attributes: {},
        resource: {
          attributes: {},
        },
      });
    });
  });

  describe("when filtering by attributes", () => {
    it("should emit data to Bus with filtered by attributes", async () => {
      const res = buildResponse(new Base64String("dummy-trace-id"));
      await waitForSpan(
        res,
        {
          attributes: {
            dummyStr: "dummy-value",
            dummyReg: /abc/i,
          },
        },
        { timeoutMs: 0 },
      );

      expect(bus.emittedData.length).toBe(1);
      expect(bus.emittedData[0][1].base64TraceId).toBe("dummy-trace-id");
      expect(bus.emittedData[0][1].filter).toStrictEqual({
        name: undefined,
        attributes: {
          dummyStr: new Eq("dummy-value"),
          dummyReg: new Reg(/abc/i),
        },
        resource: {
          attributes: {},
        },
      });
    });
  });

  describe("when filtering by resource's attributes", () => {
    it("should emit data to Bus with filtered by resource's attributes", async () => {
      const res = buildResponse(new Base64String("dummy-trace-id"));
      await waitForSpan(
        res,
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

      expect(bus.emittedData.length).toBe(1);
      expect(bus.emittedData[0][1].base64TraceId).toBe("dummy-trace-id");
      expect(bus.emittedData[0][1].filter).toStrictEqual({
        name: undefined,
        attributes: {},
        resource: {
          attributes: {
            dummyStr: new Eq("dummy-value"),
            dummyReg: new Reg(/abc/i),
          },
        },
      });
    });
  });

  describe("when using eq", () => {
    it("should emit data to Bus with eq filter", async () => {
      const res = buildResponse(new Base64String("dummy-trace-id"));
      await waitForSpan(
        res,
        {
          attributes: {
            key: eq("value"),
          },
        },
        { timeoutMs: 0 },
      );

      expect(bus.emittedData.length).toBe(1);
      expect(bus.emittedData[0][1].filter).toStrictEqual({
        name: undefined,
        attributes: {
          key: new Eq("value"),
        },
        resource: {
          attributes: {},
        },
      });
    });
  });

  describe("when using RegExp", () => {
    it("should emit data to Bus with Reg filter", async () => {
      const res = buildResponse(new Base64String("dummy-trace-id"));
      await waitForSpan(
        res,
        {
          attributes: {
            key: /abc/i,
          },
        },
        { timeoutMs: 0 },
      );

      expect(bus.emittedData.length).toBe(1);
      expect(bus.emittedData[0][1].filter).toStrictEqual({
        name: undefined,
        attributes: {
          key: new Reg(/abc/i),
        },
        resource: {
          attributes: {},
        },
      });
    });
  });

  describe("when using number comparator", () => {
    it("should emit data to Bus with number comparison filter", async () => {
      const res = buildResponse(new Base64String("dummy-trace-id"));
      await waitForSpan(
        res,
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

      expect(bus.emittedData.length).toBe(1);
      expect(bus.emittedData[0][1].filter).toStrictEqual({
        name: undefined,
        attributes: {
          keyGt: new Gt(1),
          keyGte: new Gte(2),
          keyLt: new Lt(3),
          keyLte: new Lte(4),
        },
        resource: {
          attributes: {},
        },
      });
    });
  });
});
