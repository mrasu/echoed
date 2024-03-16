import { Eq } from "@/comparision/eq";
import { JsonWantSpanEventResponse } from "@/server/parameter";
import { requestWantSpanEvent } from "@/server/request";
import { buildJsonSpan } from "@/testUtil/type/jsonSpan";
import fetchMock from "jest-fetch-mock";

describe("requestWantSpanEvent", () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  const mockFetch = (response: JsonWantSpanEventResponse): void => {
    fetchMock.doMockIf(
      "http://localhost:1/events/wantSpan",
      JSON.stringify(response),
    );
  };

  describe("when server returns span", () => {
    beforeEach(() => {
      mockFetch({ span: buildJsonSpan() });
    });

    it("should return span", async () => {
      const span = await requestWantSpanEvent(1, {
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
        await requestWantSpanEvent(1, {
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
        await requestWantSpanEvent(1, {
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
