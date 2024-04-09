import { CypressFileLogger } from "@/integration/cypress/internal/infra/cypressFileLogger";
import { RequestRunner } from "@/integration/cypress/internal/requestRunner";
import { initializeEchoedContext } from "@/integration/cypress/internal/util/cypressSpec";

export class SpecHook {
  constructor(
    private spec: Cypress.Spec,
    private fileLogger: CypressFileLogger,
  ) {}

  onBeforeEach(): void {
    initializeEchoedContext(this.spec);

    const requestRunner = new RequestRunner(this.spec, this.fileLogger);
    cy.intercept("*", { middleware: true }, async (req): Promise<void> => {
      await requestRunner.run(req);
    });
  }

  onAfterEach(): void {
    this.fileLogger.writeToFile();
  }
}
