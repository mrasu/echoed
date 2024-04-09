import { waitForSpanForTraceIdWithRequester } from "@/command/bridge/span";
import { SpanFilterOption, WaitOption } from "@/command/span";
import { Span } from "@/command/spanType";
import { EchoedFatalError } from "@/echoedFatalError";
import { CypressRequester } from "@/integration/cypress/internal/infra/cypressRequester";
import { getTraceIdFromCypressResponse } from "@/integration/cypress/internal/util/cypressResponse";
import { getLastTraceIdFromCypressSpec } from "@/integration/cypress/internal/util/cypressSpec";
import { Base64String } from "@/type/base64String";

export class WaitForSpanCommander {
  constructor(
    private requester: CypressRequester,
    private spec: Cypress.Spec,
  ) {}

  async run(
    port: number,
    urlPatternOrResponse: string | RegExp | Cypress.Response<unknown>,
    filter: SpanFilterOption,
    options?: WaitOption,
  ): Promise<Span> {
    const traceId = this.extractTraceId(urlPatternOrResponse);

    return this.waitForSpanForTraceId(port, traceId, filter, options);
  }

  private extractTraceId(
    urlPatternOrResponse: string | RegExp | Cypress.Response<unknown>,
  ): Base64String {
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
    traceId: Base64String,
    filter: SpanFilterOption,
    options?: WaitOption,
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
