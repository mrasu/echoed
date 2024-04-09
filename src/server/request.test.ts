import { Eq } from "@/comparision/eq";
import { FetchRequester } from "@/server/fetchRequester";
import { JsonWaitForSpanEventResponse } from "@/server/parameter";
import { requestWaitForSpanEvent } from "@/server/request";
import { buildJsonSpan } from "@/testUtil/type/jsonSpan";
import fetchMock from "jest-fetch-mock";

describe("requestWaitForSpanEvent", () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  const mockFetch = (response: JsonWaitForSpanEventResponse): void => {
    fetchMock.doMockIf(
      "http://localhost:1/events/waitForSpan",
      JSON.stringify(response),
    );
  };

  describe("when server returns span", () => {
    beforeEach(() => {
      mockFetch({ span: buildJsonSpan() });
    });

    it("should return span", async () => {
      const requester = new FetchRequester();
      const span = await requestWaitForSpanEvent(requester, 1, {
        base64TraceId: "dummy-trace-id",
        filter: {
          name: new Eq("dummy/name"),
          attributes: {},
          resource: {
            attributes: {},
          },
        },
        waitTimeoutMs: 0,
      });

      expect(span.name).toBe("testSpan");
    });
  });

  describe("when server returns error", () => {
    beforeEach(() => {
      mockFetch({ error: true, reason: "foo-bar" });
    });

    it("should raise error", async () => {
      await expect(async () => {
        const requester = new FetchRequester();
        await requestWaitForSpanEvent(requester, 1, {
          base64TraceId: "dummy-trace-id",
          filter: {
            name: new Eq("dummy/name"),
            attributes: {},
            resource: {
              attributes: {},
            },
          },
          waitTimeoutMs: 0,
        });
      }).rejects.toThrow("foo-bar");
    });
  });

  describe("when request fails", () => {
    beforeEach(() => {
      fetchMock.mockReject(new Error("failed"));
    });

    it("should raise error", async () => {
      await expect(async () => {
        const requester = new FetchRequester();
        await requestWaitForSpanEvent(requester, 1, {
          base64TraceId: "dummy-trace-id",
          filter: {
            name: new Eq("dummy/name"),
            attributes: {},
            resource: {
              attributes: {},
            },
          },
          waitTimeoutMs: 0,
        });
      }).rejects.toThrow("failed");
    });
  });
});
