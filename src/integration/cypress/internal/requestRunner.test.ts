import { TRACEPARENT_HEADER_KEY } from "@/integration/common/commonFetchRunner";
import { RequestRunner } from "@/integration/cypress/internal/requestRunner";
import { getTraceIdFromCypressResponse } from "@/integration/cypress/internal/util/cypressResponse";
import { initializeEchoedContext } from "@/integration/cypress/internal/util/cypressSpec";
import { ECHOED_USER_AGENT } from "@/server/request";
import { buildCypressSpec } from "@/testUtil/cypress/cypressSpec";
import { buildCypressHttpResponse } from "@/testUtil/cypress/httpResponse";
import { buildCypressRequest } from "@/testUtil/cypress/request";
import { MockFileLogger } from "@/testUtil/fileLog/mockFileLogger";
import { FetchFinishedLog, FetchStartedLog } from "@/types";

describe("RequestRunner", () => {
  describe("run", () => {
    const setupRequired = (
      mockFileLogger: MockFileLogger,
    ): [RequestRunner, Cypress.Spec] => {
      const spec = buildCypressSpec();
      initializeEchoedContext(spec);

      const requestRunner = new RequestRunner(spec, mockFileLogger);

      return [requestRunner, spec];
    };

    it("should log about fetch", async () => {
      const mockFileLogger = new MockFileLogger();
      const [requestRunner, spec] = setupRequired(mockFileLogger);

      const request = buildCypressRequest();
      await requestRunner.run(request);

      expect(request.on.mock.calls.length).toBe(1);
      expect(mockFileLogger.texts.length).toBe(1);

      const response = buildCypressHttpResponse();
      await request.on.mock.calls[0][1](response);

      expect(mockFileLogger.texts.length).toBe(2);

      expect(request.headers[TRACEPARENT_HEADER_KEY]).toMatch(
        /00-[0-9a-f]{32}-[0-9a-f]{16}-01/,
      );

      const fetchStartedLog = FetchStartedLog.parse(
        JSON.parse(mockFileLogger.texts[0]),
      );
      expect(fetchStartedLog.testId).toBe(undefined);
      expect(fetchStartedLog.traceId).toEqual(expect.any(String));
      expect(fetchStartedLog.testPath).toBe(spec.relative);

      const fetchFinishedLog = FetchFinishedLog.parse(
        JSON.parse(mockFileLogger.texts[1]),
      );
      expect(fetchFinishedLog.request.url).toEqual(request.url);

      expect(getTraceIdFromCypressResponse(response)?.hexString).toBe(
        fetchStartedLog.traceId,
      );
    });

    describe("when the request is from echoed", () => {
      it("should not log about fetch", async () => {
        const mockFileLogger = new MockFileLogger();
        const [requestRunner] = setupRequired(mockFileLogger);

        const request = buildCypressRequest({
          headers: {
            "User-Agent": [ECHOED_USER_AGENT],
          },
        });
        await requestRunner.run(request);

        expect(request.on.mock.calls.length).toBe(1);

        const response = buildCypressHttpResponse();
        await request.on.mock.calls[0][1](response);

        expect(mockFileLogger.texts.length).toBe(0);
        expect(request.headers[TRACEPARENT_HEADER_KEY]).toMatch(
          /00-[0-9a-f]{32}-[0-9a-f]{16}-01/,
        );
      });
    });
  });
});
