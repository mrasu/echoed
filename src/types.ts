import opentelemetry from "@/generated/otelpbj";

export type Log =
  | TestStartedLog
  | TestFinishedLog
  | FetchStartedLog
  | FetchFinishedLog;

export type TimeHoldingLog = TestStartedLog | TestFinishedLog | FetchStartedLog;

export type TestStartedLog = {
  type: "testStarted";
  timeMillis: number;
  file: string;
  testFullName: string;
};

export type TestFinishedLog = {
  type: "testFinished";
  timeMillis: number;
  file: string;
  status: string;
  failureDetails: string[];
  failureMessages: string[];
  duration?: number;
};

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
