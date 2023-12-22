import express from "express";
import bodyParser from "body-parser";
import opentelemetry from "@/generated/otelpbj";
import http from "http";
import { sleep } from "@/util/async";
import { toBase64 } from "@/util/byte";
import { ITobikuraLogRecord } from "@/types";
import { TobikuraSpan } from "@/type/tobikuraSpan";
import { Logger } from "@/logger";

const TracesData = opentelemetry.opentelemetry.proto.trace.v1.TracesData;
const LogsData = opentelemetry.opentelemetry.proto.logs.v1.LogsData;

export class Server {
  private server?: http.Server;
  private capturedSpans: Record<string, TobikuraSpan[]> = {};
  private capturedLogs: Record<string, ITobikuraLogRecord[]> = {};

  static async start(port: number) {
    const server = new Server();
    await server.start(port);
    return server;
  }

  private async start(port: number) {
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

    this.server = server;
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

  private captureSpan(span: TobikuraSpan) {
    this.debugLogSpan(span);

    let traceId = toBase64(span.traceId);
    this.capturedSpans[traceId] = this.capturedSpans[traceId] || [];
    this.capturedSpans[traceId].push(span);
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
      this.server?.close(() => {
        resolve(undefined);
      });
    });
  }
}
