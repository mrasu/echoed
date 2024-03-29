import { MemoryBus } from "@/eventBus/infra/memoryBus";
import { SpanBus } from "@/eventBus/spanBus";
import { WantSpanRequest } from "@/eventBus/wantSpanRequest";
import opentelemetry from "@/generated/otelpbj";
import { Logger } from "@/logger";
import {
  JsonWantSpanEventRequestParam,
  JsonWantSpanEventResponse,
  restoreWantSpanEventRequestParam,
} from "@/server/parameter";
import { Base64String } from "@/type/base64String";
import { OtelLogRecord } from "@/type/otelLogRecord";
import { OtelSpan } from "@/type/otelSpan";
import { sleep } from "@/util/async";
import { toBase64 } from "@/util/byte";
import { Mutex } from "async-mutex";
import bodyParser from "body-parser";
import express from "express";
import asyncHandler from "express-async-handler";
import http from "http";

const TracesData = opentelemetry.opentelemetry.proto.trace.v1.TracesData;
const LogsData = opentelemetry.opentelemetry.proto.logs.v1.LogsData;

export class Server {
  private wantSpanRequests: Map<string, WantSpanRequest[]> = new Map();
  private mutex = new Mutex();

  private bus = new MemoryBus();
  private spanBus = new SpanBus(this.bus);
  private httpServer?: http.Server;
  private capturedSpans: Map<string, OtelSpan[]> = new Map();
  private capturedLogs: Map<string, OtelLogRecord[]> = new Map();

  static async start(port: number): Promise<Server> {
    const server = new Server();
    await server.start(port);
    return server;
  }

  private async start(port: number): Promise<void> {
    const server = await this.startHttpServer(port);
    this.startBus();

    this.httpServer = server;
  }

  private startBus(): void {
    this.spanBus.listenWantSpanEvent(async (data) => {
      const request = new WantSpanRequest(this.spanBus, data);
      await this.handleWantSpanRequest(request);
    });
  }

  private async handleWantSpanRequest(request: WantSpanRequest): Promise<void> {
    const base64TraceId = request.traceId.base64String;

    let spans: OtelSpan[] | undefined = [];
    await this.mutex.runExclusive(() => {
      spans = this.capturedSpans.get(base64TraceId);

      const requests = this.wantSpanRequests.get(base64TraceId) || [];
      requests.push(request);
      this.wantSpanRequests.set(base64TraceId, requests);
    });
    if (!spans) return;

    for (const span of spans) {
      await request.respondIfMatch(span);
    }
  }

  private async startHttpServer(port: number): Promise<http.Server> {
    const app = express();

    app.use(express.json());
    app.use(bodyParser.raw({ inflate: true, limit: "100Mb", type: "*/*" }));

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.post(
      "/v1/traces",
      asyncHandler(async (req, res, _buf) => {
        await this.handleOtelTraces(req.body as Buffer);
        res.send("{}");
      }),
    );

    app.post(
      "/v1/logs",
      asyncHandler(async (req, res, _buf) => {
        await this.handleOtelLogs(req.body as Buffer);
        res.send("{}");
      }),
    );

    app.post(
      "/events/wantSpan",
      asyncHandler(async (req, res) => {
        const response = await this.handleWantSpanEvent(req.body as string);
        res.send(JSON.stringify(response));
      }),
    );

    const server = await new Promise<http.Server>((resolve) => {
      const server = app.listen(port, () => {
        resolve(server);
      });
    });

    return server;
  }

  private async handleOtelTraces(body: Buffer): Promise<void> {
    const tracesData = TracesData.decode(body);
    const otelSpans: OtelSpan[] = [];
    tracesData.resourceSpans.forEach((resourceSpan) => {
      resourceSpan.scopeSpans?.forEach((scopeSpan) => {
        scopeSpan.spans?.forEach((span) => {
          const resource =
            resourceSpan.resource as opentelemetry.opentelemetry.proto.resource.v1.Resource;
          const scope =
            scopeSpan.scope as opentelemetry.opentelemetry.proto.common.v1.InstrumentationScope;
          const otelSpan = new OtelSpan(span, resource, scope);
          otelSpans.push(otelSpan);
        });
      });
    });

    for (const otelSpan of otelSpans) {
      await this.captureSpan(otelSpan);
    }
  }

  private async handleOtelLogs(body: Buffer): Promise<void> {
    const logsData = LogsData.decode(body);

    const otelLogs: OtelLogRecord[] = [];
    logsData.resourceLogs.forEach((resourceLog) => {
      resourceLog.scopeLogs?.forEach((scopeLog) => {
        scopeLog.logRecords?.forEach((log) => {
          const otelLogRecord = new OtelLogRecord(log);
          otelLogs.push(otelLogRecord);
        });
      });
    });

    for (const otelLogRecord of otelLogs) {
      await this.captureLog(otelLogRecord);
    }
  }

  private async captureSpan(span: OtelSpan): Promise<void> {
    this.debugLogSpan(span);

    const traceId = toBase64(span.traceId).base64String;

    await this.mutex.runExclusive(() => {
      if (!this.capturedSpans.has(traceId)) {
        this.capturedSpans.set(traceId, []);
      }
      this.capturedSpans.get(traceId)?.push(span);
    });

    const requests = this.wantSpanRequests.get(traceId) ?? [];
    const notMatchRequests = requests.filter((request) => {
      if (request.matches(span)) {
        void request.respond(span);
        return false;
      } else {
        return true;
      }
    });

    await this.mutex.runExclusive(() => {
      this.wantSpanRequests.set(traceId, notMatchRequests);
    });
  }

  private async captureLog(log: OtelLogRecord): Promise<void> {
    this.debugLogLogRecord(log);

    const traceId = toBase64(log.traceId).base64String;

    await this.mutex.runExclusive(() => {
      if (!this.capturedLogs.has(traceId)) {
        this.capturedLogs.set(traceId, []);
      }
      this.capturedLogs.get(traceId)?.push(log);
    });
  }

  private async handleWantSpanEvent(
    body: string,
  ): Promise<JsonWantSpanEventResponse> {
    const param = JsonWantSpanEventRequestParam.parse(JSON.parse(body));
    const wantSpanEvent = restoreWantSpanEventRequestParam(param);

    const spanBus = new SpanBus(this.bus);
    const response = await spanBus.requestWantSpan(
      new Base64String(wantSpanEvent.base64TraceId),
      wantSpanEvent.filter,
      10000,
    );
    if ("error" in response) {
      return response;
    } else {
      return { span: response };
    }
  }

  private debugLogSpan(span: OtelSpan): void {
    Logger.debug("Trace", "JSON", JSON.stringify(span));
  }

  private debugLogLogRecord(log: OtelLogRecord): void {
    Logger.debug("Log", "JSON", JSON.stringify(log));
  }

  async stopAfter(waitSec: number): Promise<{
    capturedSpans: Map<string, OtelSpan[]>;
    capturedLogs: Map<string, OtelLogRecord[]>;
  }> {
    Logger.writeWithTag(`waiting for OpenTelemetry for ${waitSec} seconds`);
    await sleep(1000 * waitSec, () => {
      Logger.write(".");
    });
    Logger.write("\n");

    await this.stop();

    return {
      capturedSpans: this.capturedSpans,
      capturedLogs: this.capturedLogs,
    };
  }

  private async stop(): Promise<void> {
    await new Promise((resolve) => {
      this.httpServer?.close(() => {
        resolve(undefined);
      });
    });
  }
}
