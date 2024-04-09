import { WaitForSpanCommander } from "@/integration/cypress/internal/command/waitForSpanCommander";
import {
  initializeEchoedContext,
  setTraceIdToCypressSpec,
} from "@/integration/cypress/internal/util/cypressSpec";
import { JsonWantSpanEventResponse } from "@/server/parameter";
import { ECHOED_USER_AGENT, USER_AGENT_HEADER_KEY } from "@/server/request";
import { Requester } from "@/server/requester";
import { buildCypressSpec } from "@/testUtil/cypress/cypressSpec";
import { Base64String } from "@/type/base64String";
import { mock } from "jest-mock-extended";

describe("WaitForSpanCommander", () => {
  const url = "https://example.com";

  describe("run", () => {
    const response: JsonWantSpanEventResponse = {
      span: {
        attributes: [],
        traceId: "traceId",
        spanId: "spanId",
        parentSpanId: "parentSpanId",
        name: "foo",
      },
    };

    it("should return a Span", async () => {
      const requester = mock<Requester>({
        post: jest
          .fn()
          .mockResolvedValue({ status: 200, body: JSON.stringify(response) }),
      });
      const spec = buildCypressSpec();
      initializeEchoedContext(spec);
      setTraceIdToCypressSpec(spec, url, new Base64String("traceId"));
      const commander = new WaitForSpanCommander(requester, spec);

      const span = await commander.run(1234, url, {});

      expect(span.name).toEqual("foo");
      expect(requester.post.mock.calls[0]).toEqual([
        "http://localhost:1234/events/wantSpan",
        {
          [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
        },
        JSON.stringify({
          base64TraceId: "traceId",
          filter: { attributes: {}, resource: { attributes: {} } },
          waitTimeoutMs: 10000,
        }),
      ]);
    });
  });
});
