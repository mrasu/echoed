import { OtelLogStore } from "@/server/store/otelLogStore";
import { buildTraceId } from "@/testUtil/otel/id";
import { buildOtelLogRecord } from "@/testUtil/otel/otelLogRecord";
import { toHex } from "@/util/byte";

describe("OtelLogStore", () => {
  describe("capture", () => {
    describe("when traceId not exists", () => {
      it("should add log", async () => {
        const store = new OtelLogStore();
        const log = buildOtelLogRecord();
        await store.capture(log);

        expect(store.capturedLogs).toEqual(
          new Map([[toHex(log.traceId).hexString, [log]]]),
        );
      });
    });

    describe("when the same traceId already captured", () => {
      it("should add log", async () => {
        const store = new OtelLogStore();
        const log1 = buildOtelLogRecord({ body: { stringValue: "log1" } });
        const log2 = buildOtelLogRecord({ body: { stringValue: "log2" } });
        await store.capture(log1);
        await store.capture(log2);

        expect(store.capturedLogs).toEqual(
          new Map([[toHex(log1.traceId).hexString, [log1, log2]]]),
        );
      });
    });

    describe("when the different traceId exists", () => {
      it("should add log", async () => {
        const store = new OtelLogStore();
        const traceId1 = buildTraceId();
        const traceId2 = buildTraceId();
        const log1 = buildOtelLogRecord({ traceId: traceId1.uint8Array });
        const log2 = buildOtelLogRecord({ traceId: traceId2.uint8Array });
        await store.capture(log1);
        await store.capture(log2);

        expect(store.capturedLogs).toEqual(
          new Map([
            [traceId1.hexString, [log1]],
            [traceId2.hexString, [log2]],
          ]),
        );
      });
    });
  });
});
