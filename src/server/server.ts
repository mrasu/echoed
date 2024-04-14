import { MemoryBus } from "@/eventBus/infra/memoryBus";
import { Logger } from "@/logger";
import { EventController } from "@/server/constroller/eventController";
import { OtelLogController } from "@/server/constroller/otelLogController";
import { OtelTraceController } from "@/server/constroller/otelTraceController";
import { IServer } from "@/server/iServer";
import { ServerSpanBus } from "@/server/serverSpanBus";
import { OtelService } from "@/server/service/otelService";
import { StateService } from "@/server/service/stateService";
import { TestRecordService } from "@/server/service/testRecordService";
import { WaitForSpanService } from "@/server/service/waitForSpanService";
import { OtelLogStore } from "@/server/store/otelLogStore";
import { OtelSpanStore } from "@/server/store/otelSpanStore";
import { StateStore } from "@/server/store/stateStore";
import { TestCaseStore } from "@/server/store/testCaseStore";
import { WaitForSpanRequestStore } from "@/server/store/waitForSpanRequestStore";
import { OtelLogRecord } from "@/type/otelLogRecord";
import { OtelSpan } from "@/type/otelSpan";
import { TestCase } from "@/type/testCase";
import { sleep } from "@/util/async";
import { Mutex } from "async-mutex";
import bodyParser from "body-parser";
import express, { Application } from "express";
import asyncHandler from "express-async-handler";
import http from "http";

const WAIT_FOR_ALL_END_MS = 1000;

export class Server implements IServer {
  private spanMutex = new Mutex();

  private bus = new MemoryBus();
  private httpServer?: http.Server;
  private otelSpanStore = new OtelSpanStore(this.spanMutex);
  private otelLogStore = new OtelLogStore();
  private waitForSpanRequestStore = new WaitForSpanRequestStore(this.spanMutex);
  private testCaseStore = new TestCaseStore();

  private stateStore = new StateStore();

  static async start(port: number): Promise<Server> {
    const server = new Server();
    await server.start(port);
    return server;
  }

  private async start(port: number): Promise<void> {
    const server = await this.startHttpServer(port);

    ServerSpanBus.startListening(
      this.bus,
      this.otelSpanStore,
      this.waitForSpanRequestStore,
    );

    this.httpServer = server;
  }

  private async startHttpServer(port: number): Promise<http.Server> {
    const app = express();

    app.use(express.json());
    app.use(bodyParser.raw({ inflate: true, limit: "100Mb", type: "*/*" }));

    this.route(app);

    const server = await new Promise<http.Server>((resolve) => {
      const server = app.listen(port, () => {
        resolve(server);
      });
    });

    return server;
  }

  private route(app: Application): void {
    const otelService = new OtelService(
      this.otelSpanStore,
      this.otelLogStore,
      this.waitForSpanRequestStore,
    );
    const waitForSpanService = new WaitForSpanService(this.bus);
    const testRecordService = new TestRecordService(this.testCaseStore);
    const stateService = new StateService(this.stateStore);

    const otelTraceController = new OtelTraceController(otelService);
    const otelLogController = new OtelLogController(otelService);
    const eventController = new EventController(
      waitForSpanService,
      testRecordService,
      stateService,
    );

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.post(
      "/v1/traces",
      asyncHandler(async (req, res, _buf) => {
        const resBody = await otelTraceController.post(req.body as Buffer);
        res.send(resBody);
      }),
    );

    app.post(
      "/v1/logs",
      asyncHandler(async (req, res, _buf) => {
        const resBody = await otelLogController.post(req.body as Buffer);
        res.send(resBody);
      }),
    );

    app.post(
      "/events/waitForSpan",
      asyncHandler(async (req, res) => {
        const response = await eventController.waitForSpan(req.body as string);
        res.send(JSON.stringify(response));
      }),
    );

    app.post(
      "/events/testFinished",
      asyncHandler(async (req, res) => {
        const response = await eventController.testFinished(req.body as string);
        res.send(JSON.stringify(response));
      }),
    );

    app.post(
      "/events/state",
      asyncHandler(async (req, res) => {
        const response = await eventController.stateChanged(req.body as string);
        res.send(JSON.stringify(response));
      }),
    );
  }

  async stopAfter(waitSec: number): Promise<{
    capturedSpans: Map<string, OtelSpan[]>;
    capturedLogs: Map<string, OtelLogRecord[]>;
    capturedTestCases: Map<string, TestCase[]>;
  }> {
    Logger.writeWithTag(`waiting for OpenTelemetry for ${waitSec} seconds`);
    await sleep(1000 * waitSec, () => {
      Logger.write(".");
    });
    Logger.write("\n");

    await this.stop();

    return {
      capturedSpans: this.otelSpanStore.capturedSpans,
      capturedLogs: this.otelLogStore.capturedLogs,
      capturedTestCases: this.testCaseStore.capturedTestCases,
    };
  }

  private async stop(): Promise<void> {
    if (!this.stateStore.isEmpty()) {
      await sleep(WAIT_FOR_ALL_END_MS);
      if (!this.stateStore.isEmpty()) {
        Logger.warn("Stop server despite ongoing processes", this.stateStore);
      }
    }

    await new Promise((resolve) => {
      this.httpServer?.close(() => {
        resolve(undefined);
      });
    });
  }
}
