import { opentelemetry } from "@/generated/otelpbj";
import { OtelService } from "@/server/service/otelService";
import { OtelLogStore } from "@/server/store/otelLogStore";
import { OtelSpanStore } from "@/server/store/otelSpanStore";
import { WaitForSpanRequestStore } from "@/server/store/waitForSpanRequestStore";
import { buildSpanId, buildTraceId } from "@/testUtil/otel/id";
import { toHex } from "@/util/byte";
import { Mutex } from "async-mutex";
import TracesData = opentelemetry.proto.trace.v1.TracesData;
import LogsData = opentelemetry.proto.logs.v1.LogsData;

describe("OtelService", () => {
  describe("handleOtelTraces", () => {
    const createStoreAndService = (): {
      spanStore: OtelSpanStore;
      otelService: OtelService;
    } => {
      const mutex = new Mutex();
      const spanStore = new OtelSpanStore(mutex);
      const otelService = new OtelService(
        spanStore,
        new OtelLogStore(),
        new WaitForSpanRequestStore(mutex),
      );

      return { spanStore, otelService };
    };

    const traceId = buildTraceId();
    const tracesData = new TracesData({
      resourceSpans: [
        {
          resource: {
            attributes: [
              {
                key: "resource-key",
                value: { stringValue: "resource-value" },
              },
            ],
          },
          scopeSpans: [
            {
              scope: {
                name: "my-scope",
              },
              spans: [
                {
                  traceId: traceId.uint8Array,
                },
              ],
            },
          ],
        },
      ],
    });

    it("should record traces", async () => {
      const { spanStore, otelService } = createStoreAndService();

      await otelService.handleOtelTraces(tracesData);

      expect(spanStore.capturedSpans.size).toBe(1);
      const span = spanStore.capturedSpans.get(traceId.hexString)?.pop();
      expect(span?.traceId).toEqual(traceId.uint8Array);
    });

    describe("when multiple spans are included", () => {
      const spanId1 = buildSpanId();
      const spanId2 = buildSpanId();
      const tracesData = new TracesData({
        resourceSpans: [
          {
            resource: {
              attributes: [
                {
                  key: "resource-key",
                  value: { stringValue: "resource-value" },
                },
              ],
            },
            scopeSpans: [
              {
                scope: {
                  name: "my-scope",
                },
                spans: [
                  {
                    traceId: traceId.uint8Array,
                    spanId: spanId1.uint8Array,
                  },
                  {
                    traceId: traceId.uint8Array,
                    spanId: spanId2.uint8Array,
                  },
                ],
              },
            ],
          },
        ],
      });

      it("should record multiple span", async () => {
        const { spanStore, otelService } = createStoreAndService();

        await otelService.handleOtelTraces(tracesData);

        expect(spanStore.capturedSpans.size).toBe(1);
        expect(spanStore.capturedSpans.get(traceId.hexString)?.length).toBe(2);

        const spanIds = new Set(
          spanStore.capturedSpans
            .get(traceId.hexString)
            ?.map((span) => toHex(span.spanId)) ?? [],
        );
        expect(spanIds).toEqual(new Set([spanId1, spanId2]));
      });
    });

    describe("when multiple traces are included", () => {
      const traceId1 = buildTraceId();
      const traceId2 = buildTraceId();

      const tracesData = new TracesData({
        resourceSpans: [
          {
            resource: {
              attributes: [
                {
                  key: "resource-key",
                  value: { stringValue: "resource-value" },
                },
              ],
            },
            scopeSpans: [
              {
                scope: {
                  name: "my-scope",
                },
                spans: [
                  {
                    traceId: traceId1.uint8Array,
                  },
                  {
                    traceId: traceId2.uint8Array,
                  },
                ],
              },
            ],
          },
        ],
      });

      it("should record multiple traces", async () => {
        const { spanStore, otelService } = createStoreAndService();

        await otelService.handleOtelTraces(tracesData);

        expect(new Set(spanStore.capturedSpans.keys())).toEqual(
          new Set([traceId1.hexString, traceId2.hexString]),
        );

        const spans = [];
        for (const capturedSpans of spanStore.capturedSpans.values()) {
          spans.push(...capturedSpans);
        }
        const traceIds = new Set(spans.map((v) => toHex(v.traceId)));
        expect(traceIds).toEqual(new Set([traceId1, traceId2]));
      });
    });
  });

  describe("handleOtelLogs", () => {
    const createStoreAndService = (): {
      logStore: OtelLogStore;
      otelService: OtelService;
    } => {
      const mutex = new Mutex();
      const logStore = new OtelLogStore();
      const otelService = new OtelService(
        new OtelSpanStore(mutex),
        logStore,
        new WaitForSpanRequestStore(mutex),
      );

      return { logStore, otelService };
    };

    const traceId = buildTraceId();
    const logsData = new LogsData({
      resourceLogs: [
        {
          resource: {
            attributes: [
              {
                key: "resource-key",
                value: { stringValue: "resource-value" },
              },
            ],
          },
          scopeLogs: [
            {
              scope: {
                name: "my-scope",
              },
              logRecords: [
                {
                  traceId: traceId.uint8Array,
                },
              ],
            },
          ],
        },
      ],
    });

    it("should record traces", async () => {
      const { logStore, otelService } = createStoreAndService();

      await otelService.handleOtelLogs(logsData);

      expect(logStore.capturedLogs.size).toBe(1);
      const span = logStore.capturedLogs.get(traceId.hexString)?.pop();
      expect(span?.traceId).toEqual(traceId.uint8Array);
    });

    describe("when multiple spans are included", () => {
      const spanId1 = buildSpanId();
      const spanId2 = buildSpanId();
      const logsData = new LogsData({
        resourceLogs: [
          {
            resource: {
              attributes: [
                {
                  key: "resource-key",
                  value: { stringValue: "resource-value" },
                },
              ],
            },
            scopeLogs: [
              {
                scope: {
                  name: "my-scope",
                },
                logRecords: [
                  {
                    traceId: traceId.uint8Array,
                    spanId: spanId1.uint8Array,
                  },
                  {
                    traceId: traceId.uint8Array,
                    spanId: spanId2.uint8Array,
                  },
                ],
              },
            ],
          },
        ],
      });

      it("should record multiple span", async () => {
        const { logStore, otelService } = createStoreAndService();

        await otelService.handleOtelLogs(logsData);

        expect(logStore.capturedLogs.size).toBe(1);
        expect(logStore.capturedLogs.get(traceId.hexString)?.length).toBe(2);

        const spanIds = new Set(
          logStore.capturedLogs
            .get(traceId.hexString)
            ?.map((span) => toHex(span.spanId)) ?? [],
        );
        expect(spanIds).toEqual(new Set([spanId1, spanId2]));
      });
    });

    describe("when multiple traces are included", () => {
      const traceId1 = buildTraceId();
      const traceId2 = buildTraceId();

      const tracesData = new LogsData({
        resourceLogs: [
          {
            resource: {
              attributes: [
                {
                  key: "resource-key",
                  value: { stringValue: "resource-value" },
                },
              ],
            },
            scopeLogs: [
              {
                scope: {
                  name: "my-scope",
                },
                logRecords: [
                  {
                    traceId: traceId1.uint8Array,
                  },
                  {
                    traceId: traceId2.uint8Array,
                  },
                ],
              },
            ],
          },
        ],
      });

      it("should record multiple traces", async () => {
        const { logStore, otelService } = createStoreAndService();

        await otelService.handleOtelLogs(tracesData);

        expect(new Set(logStore.capturedLogs.keys())).toEqual(
          new Set([traceId1.hexString, traceId2.hexString]),
        );

        const spans = [];
        for (const capturedSpans of logStore.capturedLogs.values()) {
          spans.push(...capturedSpans);
        }
        const traceIds = new Set(spans.map((v) => toHex(v.traceId)));
        expect(traceIds).toEqual(new Set([traceId1, traceId2]));
      });
    });
  });
});
