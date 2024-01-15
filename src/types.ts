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
