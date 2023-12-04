export type Log =
  | TestStartedLog
  | TestFinishedLog
  | FetchStartedLog
  | FetchFinishedLog;

export type TimeHoldingLog = TestStartedLog | TestFinishedLog | FetchStartedLog;

export type TestStartedLog = {
  type: "testStarted";
  time: string;
  file: string;
  testFullName: string;
};

export type TestFinishedLog = {
  type: "testFinished";
  time: string;
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
  time: string;
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
