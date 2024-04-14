export type FetchInfo = {
  traceId: string;
  request: {
    url: string;
    method: string;
    body?: string;
  };
  response:
    | {
        status: number;
        body?: string;
      }
    | { failed: true; reason: string };
};
