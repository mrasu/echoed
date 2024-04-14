import {
  FulfilledWaitOption,
  waitForSpanForTraceIdWithRequester,
} from "@/command/bridge/span";
import { SpanFilterOption } from "@/command/span";
import { Span } from "@/command/spanType";
import { EchoedFatalError } from "@/echoedFatalError";
import { getTraceIdFromCypressResponse } from "@/integration/cypress/internal/util/cypressResponse";
import { getLastTraceIdFromCypressSpec } from "@/integration/cypress/internal/util/cypressSpec";
import { Requester } from "@/server/requester/requester";
import { HexString } from "@/type/hexString";

export class WaitForSpanCommander {
  constructor(
    private requester: Requester,
    private spec: Cypress.Spec,
  ) {}

  async run(
    port: number,
    urlPatternOrResponse: string | RegExp | Cypress.Response<unknown>,
    filter: SpanFilterOption,
    options: FulfilledWaitOption,
  ): Promise<Span> {
    const traceId = this.extractTraceId(urlPatternOrResponse);

    return this.waitForSpanForTraceId(port, traceId, filter, options);
  }

  private extractTraceId(
    urlPatternOrResponse: string | RegExp | Cypress.Response<unknown>,
  ): HexString {
    if (
      typeof urlPatternOrResponse === "object" &&
      "body" in urlPatternOrResponse
    ) {
      const traceId = getTraceIdFromCypressResponse(urlPatternOrResponse);
      if (!traceId) {
        throw new EchoedFatalError(
          "Not having Echoed's property in Response. Not the response from cy.request?",
        );
      }

      return traceId;
    }

    const traceId = getLastTraceIdFromCypressSpec(
      this.spec,
      urlPatternOrResponse,
    );
    if (!traceId) {
      throw new EchoedFatalError(
        `Not match any executed url. not using Cypress command? urlPattern: ${urlPatternOrResponse}`,
      );
    }

    return traceId;
  }

  private async waitForSpanForTraceId(
    port: number,
    traceId: HexString,
    filter: SpanFilterOption,
    options: FulfilledWaitOption,
  ): Promise<Span> {
    return waitForSpanForTraceIdWithRequester(
      this.requester,
      port,
      traceId,
      filter,
      options,
    );
  }
}
