import { ProtoCoverageCollector } from "@/coverage/proto/protoCoverageCollector";
import { Root, Service as ProtobufService } from "protobufjs";
import protobuf from "protobufjs";
import path from "path";
import { Service } from "@/coverage/proto/service";
import { OtelSpan } from "@/type/otelSpan";
import { opentelemetry } from "@/generated/otelpbj";
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
    ) => {
      const services = collector
        .getCoverage()
        .rpcCoverage?.methodCoverages.map((v) => v.service);

      expect(new Set(services)).toEqual(new Set(expectedServices));
    };

    describe("when targetServices is undefined", () => {
      it("should collect coverage from all services", async () => {
        const collector = ProtoCoverageCollector.buildFromRoot(
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
          await buildRoot(),
          ABSOLUTE_PROTO_PATH,
          new Set(["RecommendationService"]),
        );

        assertCoveredServices(collector, ["myPackage.RecommendationService"]);
      });
    });
  });

  describe("markVisited", () => {
    const buildCollector = (): ProtoCoverageCollector => {
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

      return new ProtoCoverageCollector(serviceMap);
    };

    describe("when span has matched `rpc.service` and `rpc.method` attribute", () => {
      const span = new OtelSpan({
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

      it("should mark the method as visited", async () => {
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
          },
        });
      });
    });

    describe("when span has not matching `rpc.service` attribute", () => {
      const span = new OtelSpan({
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

      it("should not mark the method as visited", async () => {
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
          },
        });
      });
    });

    describe("when span has not matching `rpc.method` attribute", () => {
      const span = new OtelSpan({
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

      it("should not mark the method as visited", async () => {
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
          },
        });
      });
    });

    describe("when span has no attributes", () => {
      const span = new OtelSpan({
        attributes: [],
      });

      it("should not mark the method as visited", async () => {
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
        kind: SpanKind.SPAN_KIND_CLIENT,
        attributes: attributes,
      });
      // just to make sure that a span having same attribute but not CLIENT will be marked as visited
      const unspecifiedSpan = new OtelSpan({
        kind: SpanKind.SPAN_KIND_UNSPECIFIED,
        attributes: attributes,
      });

      it("should not mark the method as visited", async () => {
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
          },
        });
      });
    });
  });
});
