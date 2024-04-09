import { RunInfo } from "@/integration/cypress/internal/runInfo";
import { request } from "@/integration/cypress/support/command/request";
import { waitForSpan } from "@/integration/cypress/support/command/waitForSpan";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Cypress = typeof import("cypress");

export function installCommands(runInfo: RunInfo): void {
  Cypress.Commands.add("waitForSpan", waitForSpan);

  Cypress.Commands.overwrite("request", (originalFn, ...origArgs) => {
    return request(runInfo, originalFn, ...origArgs);
  });
}
