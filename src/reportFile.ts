import fs from "fs";
import path from "path";
import opentelemetry from "./generated/otelpbj";
import { FetchFinishedLog, Log, TimeHoldingLog } from "./types";

type ISpan = opentelemetry.opentelemetry.proto.trace.v1.ISpan;
type ILogRecord = opentelemetry.opentelemetry.proto.logs.v1.ILogRecord;

type TobikuraParam = {
  testInfos: TestInfo[];
};

type TestInfo = {
  testId: string;
  file: string;
  name: string;
  status: string;
  orderedTraceIds: string[];
  fetches: Fetch[];
  failureDetails?: string[];
  failureMessages?: string[];
  duration?: number;
  spans: any[];
  logRecords: any[];
};

type Fetch = {
  traceId: string;
  response: FetchResponse;
  request: FetchRequest;
};

type FetchResponse = {
  status: number;
  body?: string;
};

type FetchRequest = {
  url: string;
  method: string;
  body?: string;
};

const reportHtmlTemplatePath = path.resolve(
  __dirname,
  "reporter/dist/index.html",
);

export class ReportFile {
  constructor(
    private outputFilePath: string,
    private tmpLogDir: string,
  ) {}

  async generate(
    capturedSpans: Record<string, ISpan[]>,
    capturedLogs: Record<string, ILogRecord[]>,
  ) {
    const logs = this.readLogs();
    const testInfos = this.toTestInfos(logs);

    const htmlContent = await fs.promises.readFile(
      reportHtmlTemplatePath,
      "utf-8",
    );

    const tobikuraParam = this.createTobikuraParam(
      testInfos,
      capturedSpans,
      capturedLogs,
    );

    const fileContent = htmlContent.replace(
      /<!-- -z- replace:dummy start -z- -->.+<!-- -z- replace:dummy end -z- -->/s,
      `
    <script>
    window.__tobikura_param__ = ${JSON.stringify(tobikuraParam)}
    </script>
    `,
    );

    await fs.promises.mkdir(path.dirname(this.outputFilePath), {
      recursive: true,
    });
    await fs.promises.writeFile(this.outputFilePath, fileContent, "utf-8");
  }

  private readLogs(): Log[] {
    const logFiles = fs.readdirSync(this.tmpLogDir);

    const rawLogs = logFiles
      .map((file: string) =>
        fs.readFileSync(path.join(this.tmpLogDir, file), "utf-8").split("\n"),
      )
      .flat();

    const logs: Log[] = [];
    rawLogs.forEach((rawLog: string) => {
      let parsed: any;
      try {
        parsed = JSON.parse(rawLog);
      } catch (e) {
        return;
      }

      if (parsed.type === "testStarted") {
        logs.push({
          type: "testStarted",
          file: parsed.file,
          testFullName: parsed.testFullName,
          time: parsed.time,
        });
      } else if (parsed.type === "testFinished") {
        logs.push({
          type: "testFinished",
          duration: parsed.duration,
          failureDetails: parsed.failureDetails,
          failureMessages: parsed.failureMessages,
          file: parsed.file,
          status: parsed.status,
          time: parsed.time,
        });
      } else if (parsed.type === "fetchStarted") {
        logs.push({
          type: "fetchStarted",
          time: parsed.time,
          traceId: parsed.traceId,
          testPath: parsed.testPath,
        });
      } else if (parsed.type === "fetchFinished") {
        logs.push({
          type: "fetchFinished",
          traceId: parsed.traceId,
          request: {
            url: parsed.request.url,
            method: parsed.request.method,
            body: parsed.request.body
              ? JSON.stringify(parsed.request.body)
              : undefined,
          },
          response: {
            status: parsed.response.status,
            body: parsed.response.body
              ? JSON.stringify(parsed.response.body)
              : undefined,
          },
        });
      } else {
        console.warn("unknown log type found: ", parsed.type);
      }
    });

    return logs;
  }

  private toTestInfos(logs: Log[]): TestInfo[] {
    const timeHoldingLogs = this.extractOrderedTimeHoldingLogs(logs);
    const fetchFinishedRecord = this.extractFetchFinishedLogAsRecord(logs);

    const currentTestForFile: Record<string, TestInfo> = {};
    const testInfos: TestInfo[] = [];
    let testId = 0;
    for (const log of timeHoldingLogs) {
      if (log.type === "testStarted") {
        const testInfo: TestInfo = {
          testId: testId.toString(),
          file: log.file,
          name: log.testFullName,
          status: "unknown",
          orderedTraceIds: [],
          fetches: [],
          spans: [],
          logRecords: [],
        };
        currentTestForFile[testInfo.file] = testInfo;

        testId++;
      } else if (log.type === "testFinished") {
        const testInfo = currentTestForFile[log.file];
        if (!testInfo) {
          // No testInfo when `.test` file is empty.
          continue;
        }

        testInfo.status = log.status;
        testInfo.failureDetails = log.failureDetails;
        testInfo.failureMessages = log.failureMessages;
        testInfo.duration = log.duration;

        testInfos.push(testInfo);
        delete currentTestForFile[log.file];
      } else if (log.type === "fetchStarted") {
        const testInfo = currentTestForFile[log.testPath];
        if (!testInfo) {
          // Ignore request outside of test
          continue;
        }

        testInfo.orderedTraceIds.push(log.traceId);
        const fetchFinishedLog = fetchFinishedRecord[log.traceId];
        if (!fetchFinishedLog) {
          console.error("Invalid state: requestLog not found", log);
          continue;
        }

        const fetch: Fetch = {
          traceId: fetchFinishedLog.traceId,
          request: {
            url: fetchFinishedLog.request.url,
            method: fetchFinishedLog.request.method,
            body: fetchFinishedLog.request.body,
          },
          response: {
            status: fetchFinishedLog.response.status,
            body: fetchFinishedLog.response.body,
          },
        };
        testInfo.fetches.push(fetch);
      }
    }

    return testInfos;
  }

  private extractOrderedTimeHoldingLogs(logs: Log[]): TimeHoldingLog[] {
    const timeHoldingLogs: TimeHoldingLog[] = [];
    for (const log of logs) {
      if (
        log.type === "fetchStarted" ||
        log.type === "testStarted" ||
        log.type === "testFinished"
      ) {
        timeHoldingLogs.push(log);
      }
    }
    timeHoldingLogs.sort((a, b) => {
      return a.time > b.time ? 1 : -1;
    });

    return timeHoldingLogs;
  }

  private extractFetchFinishedLogAsRecord(
    logs: Log[],
  ): Record<string, FetchFinishedLog> {
    const fetchRequestRecord: Record<string, FetchFinishedLog> = {};
    for (const log of logs) {
      if (log.type !== "fetchFinished") {
        continue;
      }
      fetchRequestRecord[log.traceId] = log;
    }

    return fetchRequestRecord;
  }

  private createTobikuraParam(
    testInfos: TestInfo[],
    capturedSpans: Record<string, ISpan[]>,
    capturedLogs: Record<string, ILogRecord[]>,
  ): TobikuraParam {
    for (const testInfo of testInfos) {
      let traceSpans: ISpan[] = [];
      let traceLogs: ILogRecord[] = [];

      for (const traceId of testInfo.orderedTraceIds) {
        traceSpans = traceSpans.concat(capturedSpans[traceId]);
        traceLogs = traceLogs.concat(capturedLogs[traceId]);
      }

      testInfo.spans = traceSpans;
      testInfo.logRecords = traceLogs;
    }

    return { testInfos: testInfos };
  }
}
