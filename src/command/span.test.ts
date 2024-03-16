import { waitForSpan } from "@/command/span";
import { EchoedFatalError } from "@/echoedFatalError";
import { deleteServerPortFromEnv, setServerPortToEnv } from "@/env";
import { jsonWantSpanEventResponse } from "@/server/parameter";
import { buildJsonSpan } from "@/testUtil/type/jsonSpan";
import { setTraceIdToResponse } from "@/traceLoggingFetch";
import { Base64String } from "@/type/base64String";
import fetchMock from "jest-fetch-mock";

describe("waitForSpan", () => {
  let res: Response;
  beforeEach(() => {
    res = {} as Response;

    fetchMock.enableMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  describe("when no traceId is set to response", () => {
    it("should raise error", async () => {
      await expect(async () => {
        await waitForSpan(
          res,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow(EchoedFatalError);
    });
  });

  describe("when traceId is set to response", () => {
    beforeEach(() => {
      setTraceIdToResponse(res, new Base64String("dummy-trace-id"));
    });

    describe("when server-port env is not set anywhere", () => {
      it("should raise error", async () => {
        await expect(async () => {
          await waitForSpan(
            res,
            {
              name: "dummy/name",
            },
            { timeoutMs: 0 },
          );
        }).rejects.toThrow(EchoedFatalError);
      });
    });

    describe("when server-port env is set", () => {
      beforeEach(() => {
        setServerPortToEnv(1);

        const response: jsonWantSpanEventResponse = {
          span: buildJsonSpan(),
        };
        fetchMock.doMockIf(
          "http://localhost:1/events/wantSpan",
          JSON.stringify(response),
        );
      });

      afterEach(() => {
        deleteServerPortFromEnv();
      });

      it("should emit data to server", async () => {
        const span = await waitForSpan(
          res,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
        expect(span.name).toBe("testSpan");
      });
    });
  });
});
