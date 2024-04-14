import { WaitForSpanCommander } from "@/integration/cypress/internal/command/waitForSpanCommander";
import {
  initializeEchoedContext,
  setTraceIdToCypressSpec,
} from "@/integration/cypress/internal/util/cypressSpec";
import { WaitForSpanEventResponse } from "@/server/parameter/waitForSpanParameter";
import { ECHOED_USER_AGENT, USER_AGENT_HEADER_KEY } from "@/server/request";
import { Requester } from "@/server/requester/requester";
import { buildCypressSpec } from "@/testUtil/cypress/cypressSpec";
import { HexString } from "@/type/hexString";
import { mock } from "jest-mock-extended";

describe("WaitForSpanCommander", () => {
  const url = "https://example.com";

  describe("run", () => {
    const response: WaitForSpanEventResponse = {
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
      setTraceIdToCypressSpec(spec, url, new HexString("traceId"));
      const commander = new WaitForSpanCommander(requester, spec);

      const span = await commander.run(1234, url, {}, { timeoutMs: 10000 });

      expect(span.name).toEqual("foo");
      expect(requester.post.mock.calls[0]).toEqual([
        "http://localhost:1234/events/waitForSpan",
        {
          [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
        },
        JSON.stringify({
          hexTraceId: "traceId",
          filter: { attributes: {}, resource: { attributes: {} } },
          waitTimeoutMs: 10000,
        }),
      ]);
    });
  });
});
