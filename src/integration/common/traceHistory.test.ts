import { TraceHistory } from "@/integration/common/traceHistory";
import { HexString } from "@/type/hexString";

describe("TraceHistory", () => {
  describe("push", () => {
    it("should push the trace", () => {
      const traceHistory = new TraceHistory();
      const traceId = new HexString("traceId");
      traceHistory.push("url", traceId);
      expect(traceHistory.copiedTraces).toEqual([["url", traceId]]);
    });

    describe("when push the same url multiple times", () => {
      it("should hold all traces", () => {
        const traceHistory = new TraceHistory();
        const traceId1 = new HexString("traceId1");
        const traceId2 = new HexString("traceId2");
        traceHistory.push("url", traceId1);
        traceHistory.push("url", traceId2);
        expect(traceHistory.copiedTraces).toEqual([
          ["url", traceId1],
          ["url", traceId2],
        ]);
      });
    });

    describe("when push the different url", () => {
      it("should hold all traces", () => {
        const traceHistory = new TraceHistory();
        const traceId = new HexString("traceId");
        traceHistory.push("url1", traceId);
        traceHistory.push("url2", traceId);
        expect(traceHistory.copiedTraces).toEqual([
          ["url1", traceId],
          ["url2", traceId],
        ]);
      });
    });
  });

  describe("getLastTraceId", () => {
    describe("when the pattern is string", () => {
      it("should return the matched trace", () => {
        const traceHistory = new TraceHistory();
        const traceId1 = new HexString("traceId1");
        const traceId2 = new HexString("traceId2");
        traceHistory.push("url1", traceId1);
        traceHistory.push("url2", traceId2);
        expect(traceHistory.getLastTraceId("url1")).toBe(traceId1);
      });

      describe("when multiple urls are matched", () => {
        it("should return the last matched trace", () => {
          const traceHistory = new TraceHistory();
          const traceId1 = new HexString("traceId1");
          const traceId2 = new HexString("traceId2");
          traceHistory.push("url", traceId1);
          traceHistory.push("url", traceId2);
          expect(traceHistory.getLastTraceId("url")).toBe(traceId2);
        });
      });

      describe("when not matched", () => {
        it("should return undefined", () => {
          const traceHistory = new TraceHistory();
          const traceId = new HexString("traceId");
          traceHistory.push("url", traceId);
          expect(traceHistory.getLastTraceId("notMatched")).toBeUndefined();
        });
      });
    });

    describe("when the pattern is RegExp", () => {
      it("should return the matched trace", () => {
        const traceHistory = new TraceHistory();
        const traceId1 = new HexString("traceId1");
        const traceId2 = new HexString("traceId2");
        traceHistory.push("url1", traceId1);
        traceHistory.push("url2", traceId2);
        expect(traceHistory.getLastTraceId(/url1/)).toBe(traceId1);
      });

      describe("when multiple urls are matched", () => {
        it("should return the last matched trace", () => {
          const traceHistory = new TraceHistory();
          const traceId1 = new HexString("traceId1");
          const traceId2 = new HexString("traceId2");
          traceHistory.push("url1", traceId1);
          traceHistory.push("url2", traceId2);
          expect(traceHistory.getLastTraceId(/url/)).toBe(traceId2);
        });
      });

      describe("when not matched", () => {
        it("should return undefined", () => {
          const traceHistory = new TraceHistory();
          const traceId = new HexString("traceId");
          traceHistory.push("url", traceId);
          expect(traceHistory.getLastTraceId(/notMatched/)).toBeUndefined();
        });
      });
    });
  });
});
