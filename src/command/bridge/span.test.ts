import {
  waitForSpanForTraceId,
  waitForSpanForTraceIdWithRequester,
} from "@/command/bridge/span";
import { eq, gt, gte, lt, lte } from "@/command/compare";
import { Eq } from "@/comparision/eq";
import { Gt } from "@/comparision/gt";
import { Gte } from "@/comparision/gte";
import { Lt } from "@/comparision/lt";
import { Lte } from "@/comparision/lte";
import { Reg } from "@/comparision/reg";
import { WaitForSpanEventResponse } from "@/server/parameter/waitForSpanParameter";
import { ECHOED_USER_AGENT, USER_AGENT_HEADER_KEY } from "@/server/request";
import { Requester } from "@/server/requester/requester";
import { Resp } from "@/server/requester/resp";
import { buildJsonSpan } from "@/testUtil/type/jsonSpan";
import { Base64String } from "@/type/base64String";
import fetchMock from "jest-fetch-mock";

describe("waitForSpanForTraceId", () => {
  const port = 1;
  const traceId = new Base64String("dummy-trace-id");

  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    fetchMock.doMockIf(
      "http://localhost:1/events/waitForSpan",
      JSON.stringify({ span: buildJsonSpan() }),
    );
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  describe("when filtering by name", () => {
    it("should emit data to Bus with filtered by name", async () => {
      await waitForSpanForTraceId(
        port,
        traceId,
        {
          name: "dummy/name",
        },
        { timeoutMs: 0 },
      );

      expect(fetchMock.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          headers: {
            [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
          },
          body: JSON.stringify({
            base64TraceId: traceId.base64String,
            filter: {
              name: new Eq("dummy/name").toJSON(),
              attributes: {},
              resource: {
                attributes: {},
              },
            },
            waitTimeoutMs: 0,
          }),
        }),
      );
    });
  });
});

describe("waitForSpanForTraceIdWithRequester", () => {
  const port = 1;
  const traceId = new Base64String("dummy-trace-id");

  const buildRequester = (): [
    Requester,
    jest.Mock<Promise<Resp>, [string, Record<string, string>, string]>,
  ] => {
    const resp: WaitForSpanEventResponse = {
      span: buildJsonSpan(),
    };
    const post = jest
      .fn<Promise<Resp>, [string, Record<string, string>, string]>()
      .mockReturnValue(Promise.resolve(new Resp(200, JSON.stringify(resp))));
    const requester = jest.mocked<Requester>({
      post: post,
    });

    return [requester, post];
  };

  describe("when filtering by name", () => {
    it("should emit data filtered by name", async () => {
      const [requester, post] = buildRequester();
      await waitForSpanForTraceIdWithRequester(
        requester,
        port,
        traceId,
        {
          name: "dummy/name",
        },
        { timeoutMs: 0 },
      );

      expect(post.mock.calls[0][0]).toEqual(
        "http://localhost:1/events/waitForSpan",
      );
      expect(post.mock.calls[0][1]).toEqual({
        [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
      });
      expect(post.mock.calls[0][2]).toEqual(
        JSON.stringify({
          base64TraceId: traceId.base64String,
          filter: {
            name: new Eq("dummy/name").toJSON(),
            attributes: {},
            resource: {
              attributes: {},
            },
          },
          waitTimeoutMs: 0,
        }),
      );
    });
  });

  describe("when filtering by attributes", () => {
    it("should emit data filtered by attributes", async () => {
      const [requester, post] = buildRequester();
      await waitForSpanForTraceIdWithRequester(
        requester,
        port,
        traceId,
        {
          attributes: {
            dummyStr: "dummy-value",
            dummyReg: /abc/i,
          },
        },
        { timeoutMs: 0 },
      );

      expect(post.mock.calls[0][0]).toEqual(
        "http://localhost:1/events/waitForSpan",
      );
      expect(post.mock.calls[0][1]).toEqual({
        [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
      });
      expect(post.mock.calls[0][2]).toEqual(
        JSON.stringify({
          base64TraceId: traceId.base64String,
          filter: {
            attributes: {
              dummyStr: new Eq("dummy-value").toJSON(),
              dummyReg: new Reg(/abc/i).toJSON(),
            },
            resource: {
              attributes: {},
            },
          },
          waitTimeoutMs: 0,
        }),
      );
    });
  });

  describe("when filtering by resource's attributes", () => {
    it("should emit data filtered by resource's attributes", async () => {
      const [requester, post] = buildRequester();
      await waitForSpanForTraceIdWithRequester(
        requester,
        port,
        traceId,
        {
          resource: {
            attributes: {
              dummyStr: "dummy-value",
              dummyReg: /abc/i,
            },
          },
        },
        { timeoutMs: 0 },
      );

      expect(post.mock.calls[0][0]).toEqual(
        "http://localhost:1/events/waitForSpan",
      );
      expect(post.mock.calls[0][1]).toEqual({
        [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
      });
      expect(post.mock.calls[0][2]).toEqual(
        JSON.stringify({
          base64TraceId: traceId.base64String,
          filter: {
            attributes: {},
            resource: {
              attributes: {
                dummyStr: new Eq("dummy-value").toJSON(),
                dummyReg: new Reg(/abc/i).toJSON(),
              },
            },
          },
          waitTimeoutMs: 0,
        }),
      );
    });
  });

  describe("when using eq", () => {
    it("should emit data with eq filter", async () => {
      const [requester, post] = buildRequester();
      await waitForSpanForTraceIdWithRequester(
        requester,
        port,
        traceId,
        {
          attributes: {
            key: eq("value"),
          },
        },
        { timeoutMs: 0 },
      );

      expect(post.mock.calls[0][0]).toEqual(
        "http://localhost:1/events/waitForSpan",
      );
      expect(post.mock.calls[0][1]).toEqual({
        [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
      });
      expect(post.mock.calls[0][2]).toEqual(
        JSON.stringify({
          base64TraceId: traceId.base64String,
          filter: {
            attributes: {
              key: new Eq("value").toJSON(),
            },
            resource: {
              attributes: {},
            },
          },
          waitTimeoutMs: 0,
        }),
      );
    });
  });

  describe("when using RegExp", () => {
    it("should emit data with Reg filter", async () => {
      const [requester, post] = buildRequester();
      await waitForSpanForTraceIdWithRequester(
        requester,
        port,
        traceId,
        {
          attributes: {
            key: /abc/i,
          },
        },
        { timeoutMs: 0 },
      );

      expect(post.mock.calls[0][0]).toEqual(
        "http://localhost:1/events/waitForSpan",
      );
      expect(post.mock.calls[0][1]).toEqual({
        [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
      });
      expect(post.mock.calls[0][2]).toEqual(
        JSON.stringify({
          base64TraceId: traceId.base64String,
          filter: {
            attributes: {
              key: new Reg(/abc/i).toJSON(),
            },
            resource: {
              attributes: {},
            },
          },
          waitTimeoutMs: 0,
        }),
      );
    });
  });

  describe("when using number comparator", () => {
    it("should emit data with number comparison filter", async () => {
      const [requester, post] = buildRequester();
      await waitForSpanForTraceIdWithRequester(
        requester,
        port,
        traceId,
        {
          attributes: {
            keyGt: gt(1),
            keyGte: gte(2),
            keyLt: lt(3),
            keyLte: lte(4),
          },
        },
        { timeoutMs: 0 },
      );

      expect(post.mock.calls[0][0]).toEqual(
        "http://localhost:1/events/waitForSpan",
      );
      expect(post.mock.calls[0][1]).toEqual({
        [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
      });
      expect(post.mock.calls[0][2]).toEqual(
        JSON.stringify({
          base64TraceId: traceId.base64String,
          filter: {
            attributes: {
              keyGt: new Gt(1).toJSON(),
              keyGte: new Gte(2).toJSON(),
              keyLt: new Lt(3).toJSON(),
              keyLte: new Lte(4).toJSON(),
            },
            resource: {
              attributes: {},
            },
          },
          waitTimeoutMs: 0,
        }),
      );
    });
  });
});
