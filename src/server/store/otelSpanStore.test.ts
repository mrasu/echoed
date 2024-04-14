import { OtelLogStore } from "@/server/store/otelLogStore";
import { OtelSpanStore } from "@/server/store/otelSpanStore";
import { buildTraceId } from "@/testUtil/otel/id";
import { buildOtelLogRecord } from "@/testUtil/otel/otelLogRecord";
import { buildHttpOtelSpan } from "@/testUtil/otel/otelSpan";
import { toHex } from "@/util/byte";
import { Mutex } from "async-mutex";

describe("OtelSpanStore", () => {
  describe("capture", () => {
    describe("when traceId not exists", () => {
      it("should add span", async () => {
        const store = new OtelSpanStore(new Mutex());
        const span = buildHttpOtelSpan();
        await store.capture(span);

        expect(store.capturedSpans).toEqual(
          new Map([[toHex(span.traceId).hexString, [span]]]),
        );
      });
    });

    describe("when the same traceId already captured", () => {
      it("should add span", async () => {
        const store = new OtelSpanStore(new Mutex());
        const span1 = buildHttpOtelSpan({ name: "span1" });
        const span2 = buildHttpOtelSpan({ name: "span2" });
        await store.capture(span1);
        await store.capture(span2);

        expect(store.capturedSpans).toEqual(
          new Map([[toHex(span1.traceId).hexString, [span1, span2]]]),
        );
      });
    });

    describe("when the different traceId exists", () => {
      it("should add span", async () => {
        const store = new OtelLogStore();
        const traceId1 = buildTraceId();
        const traceId2 = buildTraceId();
        const span1 = buildOtelLogRecord({ traceId: traceId1.uint8Array });
        const span2 = buildOtelLogRecord({ traceId: traceId2.uint8Array });
        await store.capture(span1);
        await store.capture(span2);

        expect(store.capturedLogs).toEqual(
          new Map([
            [traceId1.hexString, [span1]],
            [traceId2.hexString, [span2]],
          ]),
        );
      });
    });
  });
});
