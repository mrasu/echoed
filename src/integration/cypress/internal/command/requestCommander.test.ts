import { TestActionLogger } from "@/fileLog/testActionLogger";
import { TRACEPARENT_HEADER_KEY } from "@/integration/common/commonFetchRunner";
import {
  ParamBag,
  RequestCommander,
} from "@/integration/cypress/internal/command/requestCommander";
import { getTraceIdFromCypressResponse } from "@/integration/cypress/internal/util/cypressResponse";
import {
  getLastTraceIdFromCypressSpec,
  initializeEchoedContext,
} from "@/integration/cypress/internal/util/cypressSpec";
import { ECHOED_USER_AGENT, USER_AGENT_HEADER_KEY } from "@/server/request";
import { buildCypressSpec } from "@/testUtil/cypress/cypressSpec";
import { buildCypressResponse } from "@/testUtil/cypress/response";
import { MockFileLogger } from "@/testUtil/fileLog/mockFileLogger";
import { FetchFinishedLog, FetchStartedLog } from "@/types";

describe("RequestCommander", () => {
  const url = "https://example.com";

  describe("buildBag", () => {
    const buildCommander = (): RequestCommander => {
      const mockFileLogger = new MockFileLogger();
      const testActionLogger = new TestActionLogger(mockFileLogger);
      const spec = buildCypressSpec();

      return new RequestCommander(testActionLogger, spec);
    };

    it("should add traceparent to headers", () => {
      const commander = buildCommander();

      const bag = commander.buildBag([url]);

      expect(bag).toMatchObject({
        requestUrl: url,
        opts: {
          headers: { [TRACEPARENT_HEADER_KEY]: expect.any(String) as string },
        },
      });
      expect(bag.traceId.base64String).toEqual(expect.any(String) as string);
    });

    describe("when args is string", () => {
      it("returns ParamBag with url", () => {
        const commander = buildCommander();

        const bag = commander.buildBag([url]);

        expect(bag).toMatchObject({
          requestUrl: url,
          opts: { url: url },
        });
      });
    });

    describe("when args is [string, body]", () => {
      it("returns ParamBag with url and body", () => {
        const commander = buildCommander();

        const bag = commander.buildBag([url, "body"]);

        expect(bag).toMatchObject({
          requestUrl: url,
          opts: { url: url, body: "body" },
        });
      });
    });

    describe("when args is [string, string]", () => {
      it("returns ParamBag with url and method", () => {
        const commander = buildCommander();

        const bag = commander.buildBag(["POST", url]);

        expect(bag).toMatchObject({
          requestUrl: url,
          opts: { url: url, method: "POST" },
        });
      });
    });

    describe("when args is [string, string, body]", () => {
      it("returns ParamBag with url and method", () => {
        const commander = buildCommander();

        const bag = commander.buildBag(["POST", url, "body"]);

        expect(bag).toMatchObject({
          requestUrl: url,
          opts: { url: url, method: "POST", body: "body" },
        });
      });
    });

    describe("when args is Cypress.RequestOptions", () => {
      it("returns ParamBag with url and method", () => {
        const commander = buildCommander();

        const bag = commander.buildBag([
          {
            url,
            method: "POST",
            body: "body",
            headers: { hello: "world" },
          },
        ]);

        expect(bag).toMatchObject({
          requestUrl: url,
          opts: {
            url: url,
            method: "POST",
            body: "body",
            headers: {
              hello: "world",
              [TRACEPARENT_HEADER_KEY]: expect.any(String) as string,
            },
          },
        });
      });
    });

    describe("when header contains Echoed UserAgent", () => {
      it("returns ParamBag with isEchoedRequest true", () => {
        const commander = buildCommander();

        const bag = commander.buildBag([
          {
            url,
            headers: { [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT },
          },
        ]);

        expect(bag).toMatchObject({
          opts: {
            url: url,
            headers: {
              [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
              [TRACEPARENT_HEADER_KEY]: expect.any(String) as string,
            },
          },
          isEchoedRequest: true,
        });
      });
    });
  });

  describe("before", () => {
    const buildCommanderAndBag = (): {
      commander: RequestCommander;
      bag: ParamBag;
      spec: Cypress.Spec;
      mockFileLogger: MockFileLogger;
    } => {
      const spec = buildCypressSpec();
      initializeEchoedContext(spec);
      const mockFileLogger = new MockFileLogger();
      const testActionLogger = new TestActionLogger(mockFileLogger);

      const commander = new RequestCommander(testActionLogger, spec);
      const bag = commander.buildBag([url]);

      return { commander, bag, spec, mockFileLogger };
    };

    it("should set traceId to spec", async () => {
      const { commander, bag, spec } = buildCommanderAndBag();

      await commander.before(bag);

      expect(getLastTraceIdFromCypressSpec(spec, /.*/)).toEqual(bag.traceId);
    });

    it("should log FetchStartedLog", async () => {
      const { commander, bag, spec, mockFileLogger } = buildCommanderAndBag();

      await commander.before(bag);

      expect(mockFileLogger.texts.length).toBe(1);

      const fetchStartedLog = FetchStartedLog.parse(
        JSON.parse(mockFileLogger.texts[0]),
      );
      expect(fetchStartedLog).toEqual({
        type: "fetchStarted",
        traceId: bag.traceId.base64String,
        testPath: spec.relative,
        timeMillis: expect.any(Number) as number,
      });
    });

    describe("when isEchoedRequest is true", () => {
      it("should not log FetchStartedLog", async () => {
        const { commander, bag, mockFileLogger } = buildCommanderAndBag();

        bag.isEchoedRequest = true;
        await commander.before(bag);

        expect(mockFileLogger.texts.length).toBe(0);
      });
    });
  });

  describe("after", () => {
    const buildCommanderAndBag = (): {
      commander: RequestCommander;
      bag: ParamBag;
      spec: Cypress.Spec;
      mockFileLogger: MockFileLogger;
    } => {
      const spec = buildCypressSpec();
      initializeEchoedContext(spec);
      const mockFileLogger = new MockFileLogger();
      const testActionLogger = new TestActionLogger(mockFileLogger);

      const commander = new RequestCommander(testActionLogger, spec);
      const bag = commander.buildBag([url]);

      return { commander, bag, spec, mockFileLogger };
    };

    it("should set traceId to response", async () => {
      const { commander, bag } = buildCommanderAndBag();

      const response = buildCypressResponse({ body: "body" });
      const newResponse = await commander.after(response, bag);

      expect(getTraceIdFromCypressResponse(newResponse)).toEqual(bag.traceId);
    });

    it("should log FetchFinishedLog", async () => {
      const { commander, bag, mockFileLogger } = buildCommanderAndBag();

      const response = buildCypressResponse({ body: "body" });
      await commander.after(response, bag);

      expect(mockFileLogger.texts.length).toEqual(1);
      const fetchFinishedLog = FetchFinishedLog.parse(
        JSON.parse(mockFileLogger.texts[0]),
      );

      expect(fetchFinishedLog).toEqual({
        type: "fetchFinished",
        traceId: bag.traceId.base64String,
        request: {
          url,
          method: "GET",
        },
        response: {
          status: 200,
          body: "body",
        },
      });
    });

    describe("when isEchoedRequest is true", () => {
      it("should not log FetchFinishedLog", async () => {
        const { commander, bag, mockFileLogger } = buildCommanderAndBag();

        bag.isEchoedRequest = true;
        const response = buildCypressResponse({ body: "body" });
        await commander.after(response, bag);

        expect(mockFileLogger.texts.length).toBe(0);
      });
    });
  });
});
