import { EchoedFatalError } from "@/echoedFatalError";
import { deleteServerPortFromEnv, setServerPortToEnv } from "@/env";
import {
  waitForSpanCreatedIn,
  waitForSpanFromPlaywrightFetch,
} from "@/integration/playwright";
import { setTraceIdToAPIResponse } from "@/integration/playwright/internal/util/apiResponse";
import { setTraceIdToContext } from "@/integration/playwright/internal/util/browserContext";
import { WaitForSpanEventResponse } from "@/server/parameter/waitForSpanParameter";
import {
  buildBrowserContext,
  buildInitializedBrowserContext,
} from "@/testUtil/playwright/browserContext";
import { buildJsonSpan } from "@/testUtil/type/jsonSpan";
import { HexString } from "@/type/hexString";
import { APIResponse } from "@playwright/test";
import fetchMock from "jest-fetch-mock";

const beforeEachFn = (): void => {
  setServerPortToEnv(1);

  fetchMock.enableMocks();
  fetchMock.resetMocks();

  const response: WaitForSpanEventResponse = {
    span: buildJsonSpan(),
  };
  fetchMock.doMockIf(
    "http://localhost:1/events/waitForSpan",
    JSON.stringify(response),
  );
};

const afterEachFn = (): void => {
  deleteServerPortFromEnv();
  fetchMock.disableMocks();
};

describe("waitForSpanCreatedIn", () => {
  beforeEach(() => {
    beforeEachFn();
  });

  afterEach(() => {
    afterEachFn();
  });

  describe("when context holds matching trace", () => {
    it("should emit data to server", async () => {
      const context = buildInitializedBrowserContext();
      setTraceIdToContext(
        context,
        "https://example.com/dummy",
        new HexString("traceId"),
      );

      const span = await waitForSpanCreatedIn(
        context,
        /.+/,
        {
          name: "dummy/name",
        },
        { timeoutMs: 0 },
      );
      expect(span.name).toBe("testSpan");
    });
  });

  describe("when context doesn't hold matching trace", () => {
    it("raise error", async () => {
      const context = buildInitializedBrowserContext();

      await expect(async () => {
        await waitForSpanCreatedIn(
          context,
          /.+/,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow(EchoedFatalError);
    });
  });

  describe("when context is not initialized", () => {
    it("raise error", async () => {
      const context = buildBrowserContext();

      await expect(async () => {
        await waitForSpanCreatedIn(
          context,
          /.+/,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow(EchoedFatalError);
    });
  });
});

describe("waitForSpanFromPlaywrightFetch", () => {
  beforeEach(() => {
    beforeEachFn();
  });

  afterEach(() => {
    afterEachFn();
  });

  describe("when response holds matching trace", () => {
    it("should emit data to server", async () => {
      const response = {} as APIResponse;
      setTraceIdToAPIResponse(response, new HexString("traceId"));

      const span = await waitForSpanFromPlaywrightFetch(
        response,
        {
          name: "dummy/name",
        },
        { timeoutMs: 0 },
      );

      expect(span.name).toBe("testSpan");
    });
  });

  describe("when response doesn't hold matching trace", () => {
    it("should emit data to server", async () => {
      const response = {} as APIResponse;

      await expect(async () => {
        await waitForSpanFromPlaywrightFetch(
          response,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow(EchoedFatalError);
    });
  });
});
