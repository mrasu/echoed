import { OpenApiCoverageCollector } from "@/coverage/openApi/openApiCoverageCollector";
import SwaggerParser from "@apidevtools/swagger-parser";
import { buildV3Document } from "@/testUtil/openapi/apiV3";
import { OtelSpan } from "@/type/otelSpan";
import { ServiceCoverageCollectorResult } from "@/coverage/iServiceCoverageCollector";
import { HttpOperationCoverage } from "@/coverage/coverageResult";
import { opentelemetry } from "@/generated/otelpbj";
import SpanKind = opentelemetry.proto.trace.v1.Span.SpanKind;
import { toBase64 } from "@/util/byte";

describe("openApiCoverageCollector", () => {
  const buildCollector = async (): Promise<OpenApiCoverageCollector> => {
    const doc = await SwaggerParser.parse(buildV3Document());
    return OpenApiCoverageCollector.buildFromDocument(doc);
  };

  const buildExpectedCoverage = (
    overrides: HttpOperationCoverage[] = [],
  ): ServiceCoverageCollectorResult => {
    const defaultOperationCoverages: HttpOperationCoverage[] = [
      {
        method: "get",
        path: "/users",
        passed: false,
      },
      {
        method: "post",
        path: "/users",
        passed: false,
      },
    ];

    const operationCoverages = [...defaultOperationCoverages];
    for (const override of overrides) {
      const operationCoverage = operationCoverages.find(
        (operationCoverage) =>
          operationCoverage.method === override.method &&
          operationCoverage.path === override.path,
      );
      if (operationCoverage) {
        operationCoverage.passed = override.passed;
      } else {
        operationCoverages.push(override);
      }
    }

    return {
      httpCoverage: {
        operationCoverages: operationCoverages,
        undocumentedOperations: [],
      },
    };
  };

  describe("markVisited() and getCoverage()", () => {
    describe("when span has `http.target` attribute", () => {
      const span = new OtelSpan({
        attributes: [
          {
            key: "http.target",
            value: {
              stringValue: "/users?hello=world#foo",
            },
          },
        ],
      });

      it("should mark the GET endpoint as visited", async () => {
        const collector = await buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual(
          buildExpectedCoverage([
            {
              method: "get",
              path: "/users",
              passed: true,
            },
          ]),
        );
      });
    });

    describe("when span has `url.path` attribute", () => {
      const span = new OtelSpan({
        attributes: [
          {
            key: "url.path",
            value: {
              stringValue: "/users",
            },
          },
        ],
      });

      it("should mark the GET endpoint as visited", async () => {
        const collector = await buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual(
          buildExpectedCoverage([
            {
              method: "get",
              path: "/users",
              passed: true,
            },
          ]),
        );
      });
    });

    describe("when span has `http.method` attribute", () => {
      const span = new OtelSpan({
        attributes: [
          {
            key: "url.path",
            value: {
              stringValue: "/users",
            },
          },
          {
            key: "http.method",
            value: {
              stringValue: "POST",
            },
          },
        ],
      });

      it("should mark the POST endpoint as visited", async () => {
        const collector = await buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual(
          buildExpectedCoverage([
            {
              method: "post",
              path: "/users",
              passed: true,
            },
          ]),
        );
      });
    });

    describe("when span has `http.request.method` attribute", () => {
      const span = new OtelSpan({
        attributes: [
          {
            key: "url.path",
            value: {
              stringValue: "/users",
            },
          },
          {
            key: "http.request.method",
            value: {
              stringValue: "POST",
            },
          },
        ],
      });

      it("should mark the POST endpoint as visited", async () => {
        const collector = await buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual(
          buildExpectedCoverage([
            {
              method: "post",
              path: "/users",
              passed: true,
            },
          ]),
        );
      });
    });

    describe("when span matches URL but is of CLIENT", () => {
      const attributes = [
        {
          key: "url.path",
          value: {
            stringValue: "/users",
          },
        },
      ];
      const clientSpan = new OtelSpan({
        kind: SpanKind.SPAN_KIND_CLIENT,
        attributes: attributes,
      });
      // just to make sure that a span having same attribute but not CLIENT will be marked as visited
      const unspecifiedSpan = new OtelSpan({
        kind: SpanKind.SPAN_KIND_UNSPECIFIED,
        attributes: attributes.concat([
          {
            key: "http.request.method",
            value: {
              stringValue: "POST",
            },
          },
        ]),
      });

      it("should not mark the endpoint as visited", async () => {
        const collector = await buildCollector();
        collector.markVisited([clientSpan, unspecifiedSpan]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual(
          buildExpectedCoverage([
            {
              method: "get",
              path: "/users",
              passed: false,
            },
            {
              method: "post",
              path: "/users",
              passed: true,
            },
          ]),
        );
      });
    });

    describe("when span doesn't match", () => {
      const traceId = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
      const span = new OtelSpan({
        traceId,
        attributes: [
          {
            key: "url.path",
            value: {
              stringValue: "/unmatched",
            },
          },
          {
            key: "http.request.method",
            value: {
              stringValue: "POST",
            },
          },
        ],
      });

      it("should mark as undocumented", async () => {
        const collector = await buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();

        const expected = {
          httpCoverage: {
            operationCoverages:
              buildExpectedCoverage().httpCoverage?.operationCoverages,
            undocumentedOperations: [
              {
                path: "/unmatched",
                method: "post",
                traceIds: [toBase64(traceId)],
              },
            ],
          },
        };
        expect(coverage).toEqual(expected);
      });
    });
  });
});
