import { fulfillWaitOption } from "@/command/bridge/span";
import { SpanFilterOption, WaitOption } from "@/command/span";
import { Span } from "@/command/spanType";
import { EchoedFatalError } from "@/echoedFatalError";
import { WaitForSpanCommander } from "@/integration/cypress/internal/command/waitForSpanCommander";
import { CypressObj } from "@/integration/cypress/internal/infra/cypressObj";
import { CypressRequester } from "@/integration/cypress/internal/infra/cypressRequester";
import { getServerPortFromCypressEnv } from "@/integration/cypress/internal/util/env";

export function waitForSpan(
  urlPatternOrResponse: string | RegExp | Cypress.Response<unknown>,
  filter: SpanFilterOption,
  options?: WaitOption,
): Cypress.Chainable<Span> {
  const cypressObj = new CypressObj(Cypress);
  const port = getServerPortFromCypressEnv(cypressObj);
  if (!port) {
    throw new EchoedFatalError(
      `No Echoed server found. not using globalSetup?`,
    );
  }

  const fulfilledOption = fulfillWaitOption(options);

  // Add 100ms for timeout.
  // Because Server will wait `fulfilledOption.timeoutMs` for span, we should wait more a bit to avoid request timeout.
  const requester = new CypressRequester(fulfilledOption.timeoutMs + 100);
  const commander = new WaitForSpanCommander(requester, Cypress.spec);
  return cy.wrap(
    commander.run(port, urlPatternOrResponse, filter, fulfilledOption),
  );
}
