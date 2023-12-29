import express from "express";
import bodyParser from "body-parser";
import opentelemetry from "@/generated/otelpbj";
import http from "http";
import { sleep } from "@/util/async";
import { toBase64 } from "@/util/byte";
import { ITobikuraLogRecord } from "@/types";
import { TobikuraSpan } from "@/type/tobikuraSpan";
import { Logger } from "@/logger";
import { FileBus } from "@/eventBus/infra/fileBus";
import { Mutex } from "async-mutex";
import { SpanBus } from "@/eventBus/spanBus";
import { WantSpanRequest } from "@/eventBus/wantSpanRequest";

const TracesData = opentelemetry.opentelemetry.proto.trace.v1.TracesData;
const LogsData = opentelemetry.opentelemetry.proto.logs.v1.LogsData;

export class Server {
  private wantSpanRequests: Map<string, WantSpanRequest[]> = new Map();
  private mutex = new Mutex();

  private buses?: FileBus[];
  private httpServer?: http.Server;
  private capturedSpans: Record<string, TobikuraSpan[]> = {};
  private capturedLogs: Record<string, ITobikuraLogRecord[]> = {};

  static async start(port: number, busFiles: string[]) {
    const server = new Server();
    await server.start(port, busFiles);
    return server;
  }

  private async start(port: number, busFiles: string[]) {
    const server = await this.startHttpServer(port);
    const buses = await this.startBus(busFiles);

    this.httpServer = server;
    this.buses = buses;
  }

  private async startBus(busFiles: string[]): Promise<FileBus[]> {
    const buses: FileBus[] = busFiles.map((file) => new FileBus(file));

    for (const bus of buses) {
      await bus.open();

      const spanBus = new SpanBus(bus);
      spanBus.listenWantSpanEvent(async (data) => {
        const request = new WantSpanRequest(spanBus, data);
        await this.handleWantSpanRequest(request);
      });
    }

    return buses;
  }

  private async handleWantSpanRequest(request: WantSpanRequest) {
    const traceId = request.traceId;

    let spans: TobikuraSpan[] | undefined = [];
    await this.mutex.runExclusive(async () => {
      spans = this.capturedSpans[traceId];

      const requests = this.wantSpanRequests.get(traceId) || [];
      requests.push(request);
      this.wantSpanRequests.set(traceId, requests);
    });

    spans?.forEach((span) => {
      request.respondIfMatch(span);
    });
  }

  private async startHttpServer(port: number): Promise<http.Server> {
    const app = express();

    app.use(bodyParser.raw({ inflate: true, limit: "100Mb", type: "*/*" }));

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.post("/v1/traces", (req, res, buf) => {
      this.handleOtelTraces(req.body);
      res.send("{}");
    });

    app.post("/v1/logs", (req, res, buf) => {
      this.handleOtelLogs(req.body);
      res.send("{}");
    });

    const server = await new Promise<http.Server>((resolve) => {
      const server = app.listen(port, () => {
        resolve(server);
      });
    });

    return server;
  }

  private handleOtelTraces(body: any) {
    const tracesData = TracesData.decode(body);
    tracesData.resourceSpans.forEach((resourceSpan) => {
      resourceSpan.scopeSpans?.forEach((scopeSpan) => {
        scopeSpan.spans?.forEach((span) => {
          const resource =
            resourceSpan.resource as opentelemetry.opentelemetry.proto.resource.v1.Resource;
          const scope =
            scopeSpan.scope as opentelemetry.opentelemetry.proto.common.v1.InstrumentationScope;
          const tobikuraSpan = new TobikuraSpan(span, resource, scope);
          this.captureSpan(tobikuraSpan);
        });
      });
    });
  }

  private handleOtelLogs(body: any) {
    const logsData = LogsData.decode(body);
    logsData.resourceLogs.forEach((resourceLog) => {
      resourceLog.scopeLogs?.forEach((scopeLog) => {
        scopeLog.logRecords?.forEach((log) => {
          this.captureLog(log);
        });
      });
    });
  }

  private async captureSpan(span: TobikuraSpan) {
    this.debugLogSpan(span);

    let traceId = toBase64(span.traceId);
    this.capturedSpans[traceId] = this.capturedSpans[traceId] || [];

    await this.mutex.runExclusive(async () => {
      this.capturedSpans[traceId].push(span);
    });

    const requests = this.wantSpanRequests.get(traceId);
    requests?.forEach((request) => {
      request.respondIfMatch(span);
    });
  }

  private captureLog(log: ITobikuraLogRecord) {
    this.debugLogLogRecord(log);

    let traceId = toBase64(log.traceId);
    this.capturedLogs[traceId] = this.capturedLogs[traceId] || [];
    this.capturedLogs[traceId].push(log);
  }

  private debugLogSpan(span: TobikuraSpan) {
    Logger.debug("Trace", "JSON", JSON.stringify(span));
  }

  private debugLogLogRecord(log: ITobikuraLogRecord) {
    Logger.debug("Log", "JSON", JSON.stringify(log));
  }

  async stopAfter(waitSec: number) {
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

  private async stop() {
    await new Promise((resolve) => {
      this.httpServer?.close(() => {
        resolve(undefined);
      });
    });

    this.buses?.forEach((bus) => {
      bus.close();
    });
  }
}
