import { Eq } from "@/comparision/eq";
import { ProtoCoverageCollector } from "@/coverage/proto/protoCoverageCollector";
import { Service } from "@/coverage/proto/service";
import { SpanCollector } from "@/coverage/proto/spanCollector";
import { opentelemetry } from "@/generated/otelpbj";
import { buildProtoConfig } from "@/testUtil/config/protoConfig";
import { OtelSpan } from "@/type/otelSpan";
import { toHex } from "@/util/byte";
import path from "path";
import protobuf, { Service as ProtobufService, Root } from "protobufjs";
import SpanKind = opentelemetry.proto.trace.v1.Span.SpanKind;

const ABSOLUTE_PROTO_PATH = path.resolve(
  path.join(__dirname, "__fixtures__/simple.proto"),
);

describe("ProtoCoverageCollector", () => {
  describe("buildFromRoot", () => {
    const buildRoot = async (): Promise<Root> => {
      const root = await protobuf.load(ABSOLUTE_PROTO_PATH);
      return root;
    };

    const assertCoveredServices = (
      collector: ProtoCoverageCollector,
      expectedServices: string[],
    ): void => {
      const services = collector
        .getCoverage()
        .rpcCoverage?.methodCoverages.map((v) => v.service);

      expect(new Set(services)).toEqual(new Set(expectedServices));
    };

    describe("when targetServices is undefined", () => {
      it("should collect coverage from all services", async () => {
        const collector = ProtoCoverageCollector.buildFromRoot(
          buildProtoConfig(),
          await buildRoot(),
          ABSOLUTE_PROTO_PATH,
          undefined,
        );

        assertCoveredServices(collector, [
          "myPackage.RecommendationService",
          "myPackage.CartService",
          "myPackage.CurrencyService",
        ]);
      });
    });

    describe("when targetServices is specified", () => {
      it("should collect coverage from specified service", async () => {
        const collector = ProtoCoverageCollector.buildFromRoot(
          buildProtoConfig(),
          await buildRoot(),
          ABSOLUTE_PROTO_PATH,
          new Set(["myPackage.RecommendationService"]),
        );

        assertCoveredServices(collector, ["myPackage.RecommendationService"]);
      });
    });

    describe("when targetServices is specified without package name", () => {
      it("should collect coverage from specified service", async () => {
        const collector = ProtoCoverageCollector.buildFromRoot(
          buildProtoConfig(),
          await buildRoot(),
          ABSOLUTE_PROTO_PATH,
          new Set(["RecommendationService"]),
        );

        assertCoveredServices(collector, ["myPackage.RecommendationService"]);
      });
    });
  });

  describe("markVisited", () => {
    const buildCollector = (
      undocumentedSpanCollector?: SpanCollector,
    ): ProtoCoverageCollector => {
      const serviceMap = new Map<string, Service>();
      serviceMap.set(
        "myPackage.CartService",
        new Service(
          ProtobufService.fromJSON("CartService", {
            methods: {
              AddItem: {
                requestType: "AddItemRequest",
                responseType: "Empty",
                comment: "",
              },
              GetCart: {
                requestType: "GetCartRequest",
                responseType: "Cart",
                comment: "",
              },
            },
          }),
        ),
      );

      return new ProtoCoverageCollector(
        serviceMap,
        undocumentedSpanCollector ?? new SpanCollector([]),
      );
    };

    const defaultTraceId = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

    describe("when span has matched `rpc.service` and `rpc.method` attribute", () => {
      const span = new OtelSpan({
        traceId: defaultTraceId,
        attributes: [
          {
            key: "rpc.service",
            value: {
              stringValue: "myPackage.CartService",
            },
          },
          {
            key: "rpc.method",
            value: {
              stringValue: "AddItem",
            },
          },
        ],
      });

      it("should mark the method as visited", () => {
        const collector = buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual({
          rpcCoverage: {
            methodCoverages: [
              {
                service: "myPackage.CartService",
                method: "AddItem",
                passed: true,
              },
              {
                service: "myPackage.CartService",
                method: "GetCart",
                passed: false,
              },
            ],
            undocumentedMethods: [],
          },
        });
      });
    });

    describe("when span has not matching `rpc.service` attribute", () => {
      const span = new OtelSpan({
        traceId: defaultTraceId,
        attributes: [
          {
            key: "rpc.service",
            value: {
              stringValue: "myPackage.AwesomeService",
            },
          },
          {
            key: "rpc.method",
            value: {
              stringValue: "AddItem",
            },
          },
        ],
      });

      const methodCoverages = [
        {
          service: "myPackage.CartService",
          method: "AddItem",
          passed: false,
        },
        {
          service: "myPackage.CartService",
          method: "GetCart",
          passed: false,
        },
      ];

      it("should not mark the method as visited", () => {
        const collector = buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual({
          rpcCoverage: {
            methodCoverages,
            undocumentedMethods: [
              {
                service: "myPackage.AwesomeService",
                method: "AddItem",
                traceIds: [toHex(defaultTraceId)],
              },
            ],
          },
        });
      });

      describe("when span matches ignore condition", () => {
        const collector = buildCollector(
          new SpanCollector([
            {
              service: new Eq("myPackage.AwesomeService"),
              method: new Eq("AddItem"),
            },
          ]),
        );
        collector.markVisited([span]);

        it("should not mark is as undocumented", () => {
          const coverage = collector.getCoverage();
          expect(coverage).toEqual({
            rpcCoverage: {
              methodCoverages,
              undocumentedMethods: [],
            },
          });
        });
      });
    });

    describe("when span has not matching `rpc.method` attribute", () => {
      const span = new OtelSpan({
        traceId: defaultTraceId,
        attributes: [
          {
            key: "rpc.service",
            value: {
              stringValue: "myPackage.CartService",
            },
          },
          {
            key: "rpc.method",
            value: {
              stringValue: "AwesomeMethod",
            },
          },
        ],
      });

      it("should not mark the method as visited", () => {
        const collector = buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual({
          rpcCoverage: {
            methodCoverages: [
              {
                service: "myPackage.CartService",
                method: "AddItem",
                passed: false,
              },
              {
                service: "myPackage.CartService",
                method: "GetCart",
                passed: false,
              },
            ],
            undocumentedMethods: [
              {
                service: "myPackage.CartService",
                method: "AwesomeMethod",
                traceIds: [toHex(defaultTraceId)],
              },
            ],
          },
        });
      });
    });

    describe("when span has no attributes", () => {
      const span = new OtelSpan({
        traceId: defaultTraceId,
        attributes: [],
      });

      it("should not mark the method as visited", () => {
        const collector = buildCollector();
        collector.markVisited([span]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual({
          rpcCoverage: {
            methodCoverages: [
              {
                service: "myPackage.CartService",
                method: "AddItem",
                passed: false,
              },
              {
                service: "myPackage.CartService",
                method: "GetCart",
                passed: false,
              },
            ],
            undocumentedMethods: [],
          },
        });
      });
    });

    describe("when span has attribute but CLIENT", () => {
      const attributes = [
        {
          key: "rpc.service",
          value: {
            stringValue: "myPackage.CartService",
          },
        },
        {
          key: "rpc.method",
          value: {
            stringValue: "AddItem",
          },
        },
      ];
      const clientSpan = new OtelSpan({
        traceId: defaultTraceId,
        kind: SpanKind.SPAN_KIND_CLIENT,
        attributes: attributes,
      });
      // just to make sure that a span having same attribute but not CLIENT will be marked as visited
      const unspecifiedSpan = new OtelSpan({
        traceId: defaultTraceId,
        kind: SpanKind.SPAN_KIND_UNSPECIFIED,
        attributes: attributes,
      });

      it("should not mark the method as visited", () => {
        const collector = buildCollector();
        collector.markVisited([clientSpan]);

        const coverage = collector.getCoverage();
        expect(coverage).toEqual({
          rpcCoverage: {
            methodCoverages: [
              {
                service: "myPackage.CartService",
                method: "AddItem",
                passed: false,
              },
              {
                service: "myPackage.CartService",
                method: "GetCart",
                passed: false,
              },
            ],
            undocumentedMethods: [],
          },
        });

        collector.markVisited([unspecifiedSpan]);
        const coverage2 = collector.getCoverage();
        expect(coverage2).toEqual({
          rpcCoverage: {
            methodCoverages: [
              {
                service: "myPackage.CartService",
                method: "AddItem",
                passed: true,
              },
              {
                service: "myPackage.CartService",
                method: "GetCart",
                passed: false,
              },
            ],
            undocumentedMethods: [],
          },
        });
      });
    });
  });
});
