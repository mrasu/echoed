import express from "express";
import bodyParser from "body-parser";
import opentelemetry from "./generated/otelpbj";
import http from "http";
import { sleep, toBase64 } from "./util";

const TracesData = opentelemetry.opentelemetry.proto.trace.v1.TracesData;
const LogsData = opentelemetry.opentelemetry.proto.logs.v1.LogsData;
type ISpan = opentelemetry.opentelemetry.proto.trace.v1.ISpan;
type ILogRecord = opentelemetry.opentelemetry.proto.logs.v1.ILogRecord;

export class Server {
  private server?: http.Server;
  private capturedSpans: Record<string, ISpan[]> = {};
  private capturedLogs: Record<string, ILogRecord[]> = {};

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
          this.captureSpan(span);
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

  private captureSpan(span: ISpan) {
    this.debugLogSpan(span);

    let traceId = toBase64(span.traceId);
    this.capturedSpans[traceId] = this.capturedSpans[traceId] || [];
    this.capturedSpans[traceId].push(span);
  }

  private captureLog(log: ILogRecord) {
    this.debugLogLogRecord(log);

    let traceId = toBase64(log.traceId);
    this.capturedLogs[traceId] = this.capturedLogs[traceId] || [];
    this.capturedLogs[traceId].push(log);
  }

  private debugLogSpan(span: ISpan) {
    console.log(
      "Trace",
      "TraceId",
      toBase64(span.traceId),
      "SpanId",
      toBase64(span.spanId),
      "ParentSpanId",
      toBase64(span.parentSpanId),
      "Name",
      span.name,
    );
  }

  private debugLogLogRecord(log: ILogRecord) {
    console.log(
      "Log",
      "TraceId",
      toBase64(log.traceId),
      "SpanId",
      toBase64(log.spanId),
      "Body",
      log.body,
    );
  }

  async stopAfter(waitSec: number) {
    await sleep(1000 * waitSec);

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
