import { Eq } from "@/comparision/eq";
import { ProtoIgnoreMethodConfig } from "@/config/config";
import { SpanCollector } from "@/coverage/proto/spanCollector";
import {
  buildHttpOtelSpan,
  buildProtoOtelSpan,
} from "@/testUtil/otel/otelSpan";
import { toBase64 } from "@/util/byte";

describe("SpanCollector", () => {
  const ignoreService = "IgnoreService";
  const ignoreMethod = "IgnoreMethod";

  const ignorePatterns: ProtoIgnoreMethodConfig[] = [
    {
      service: new Eq(ignoreService),
      method: new Eq(ignoreMethod),
    },
  ];

  describe("add", () => {
    describe("when operation is ignored", () => {
      it("should not add spans to the operations", () => {
        const collector = new SpanCollector(ignorePatterns);
        const spans = [buildProtoOtelSpan()];

        collector.add(ignoreService, ignoreMethod, spans);

        const traces = collector.toRpcMethodTraces();
        expect(traces).toEqual([]);
      });
    });

    describe("when operation is not ignored", () => {
      const spanId = toBase64(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));

      describe("when operation matches no element", () => {
        it("should add spans to the operations", () => {
          const collector = new SpanCollector(ignorePatterns);
          const spans = [buildHttpOtelSpan()];

          collector.add("myPackage.CartService", "AddItem", spans);

          const traces = collector.toRpcMethodTraces();
          expect(traces).toEqual([
            {
              service: "myPackage.CartService",
              method: "AddItem",
              traceIds: [spanId],
            },
          ]);
        });
      });

      describe("when operation matches only path", () => {
        it("should add spans to the operations", () => {
          const collector = new SpanCollector(ignorePatterns);
          const spans = [buildHttpOtelSpan()];

          collector.add(ignoreService, "AddItem", spans);

          const traces = collector.toRpcMethodTraces();
          expect(traces).toEqual([
            {
              service: ignoreService,
              method: "AddItem",
              traceIds: [spanId],
            },
          ]);
        });
      });

      describe("when operation matches only method", () => {
        it("should add spans to the operations", () => {
          const collector = new SpanCollector(ignorePatterns);
          const spans = [buildHttpOtelSpan()];

          collector.add("myPackage.CartService", ignoreMethod, spans);

          const traces = collector.toRpcMethodTraces();
          expect(traces).toEqual([
            {
              service: "myPackage.CartService",
              method: ignoreMethod,
              traceIds: [spanId],
            },
          ]);
        });
      });
    });
  });
});
