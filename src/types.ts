import opentelemetry from "@/generated/otelpbj";

export type Log = FetchStartedLog | FetchFinishedLog;

export type FetchStartedLog = {
  type: "fetchStarted";
  traceId: string;
  testPath: string;
  timeMillis: number;
};

export type FetchFinishedLog = {
  type: "fetchFinished";
  traceId: string;
  request: {
    url: string;
    method: string;
    body?: string;
  };
  response: {
    status: number;
    body?: string;
  };
};

export type ITobikuraLogRecord =
  opentelemetry.opentelemetry.proto.logs.v1.ILogRecord;
