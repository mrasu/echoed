import { Eq } from "@/comparision/eq";
import { OpenApiIgnoreOperationConfig } from "@/config/config";
import { SpanCollector } from "@/coverage/openApi/spanCollector";
import { buildHttpOtelSpan } from "@/testUtil/otel/otelSpan";
import { toBase64 } from "@/util/byte";

describe("SpanCollector", () => {
  const ignorePath = "/ignored";
  const ignoreMethod = "post";

  const ignorePatterns: OpenApiIgnoreOperationConfig[] = [
    {
      path: new Eq(ignorePath),
      method: ignoreMethod,
    },
  ];

  describe("add", () => {
    describe("when operation is ignored", () => {
      it("should not add spans to the operations", () => {
        const collector = new SpanCollector(ignorePatterns);
        const spans = [buildHttpOtelSpan()];

        collector.add(ignorePath, ignoreMethod, spans);

        const operations = collector.toHttpOperationTraces();
        expect(operations).toEqual([]);
      });
    });

    describe("when operation is not ignored", () => {
      const spanId = toBase64(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));

      describe("when operation matches no element", () => {
        it("should add spans to the operations", () => {
          const collector = new SpanCollector(ignorePatterns);
          const spans = [buildHttpOtelSpan()];

          collector.add("/users", "get", spans);

          const operations = collector.toHttpOperationTraces();
          expect(operations).toEqual([
            {
              path: "/users",
              method: "get",
              traceIds: [spanId],
            },
          ]);
        });
      });

      describe("when operation matches only path", () => {
        it("should add spans to the operations", () => {
          const collector = new SpanCollector(ignorePatterns);
          const spans = [buildHttpOtelSpan()];

          collector.add(ignorePath, "get", spans);

          const operations = collector.toHttpOperationTraces();
          expect(operations).toEqual([
            {
              path: ignorePath,
              method: "get",
              traceIds: [spanId],
            },
          ]);
        });
      });

      describe("when operation matches only method", () => {
        it("should add spans to the operations", () => {
          const collector = new SpanCollector(ignorePatterns);
          const spans = [buildHttpOtelSpan()];

          collector.add("/users", ignoreMethod, spans);

          const operations = collector.toHttpOperationTraces();
          expect(operations).toEqual([
            {
              path: "/users",
              method: ignoreMethod,
              traceIds: [spanId],
            },
          ]);
        });
      });
    });
  });
});
