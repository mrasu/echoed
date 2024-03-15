export class DummyFetcher {
  fetchArguments: [RequestInfo | URL, RequestInit?][] = [];

  buildFetch(): (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response> {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
      this.fetchArguments.push([input, init]);
      const response = new Response(JSON.stringify({ status: 200 }));
      return Promise.resolve(response);
    };
  }
}
