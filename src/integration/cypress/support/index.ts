import { CypressObj } from "@/integration/cypress/internal/infra/cypressObj";
import { RunInfo } from "@/integration/cypress/internal/runInfo";
import { SpecHook } from "@/integration/cypress/internal/specHook";
import { buildFileSpaceFromCypressEnv } from "@/integration/cypress/internal/util/fileSpace";
import { installCommands } from "@/integration/cypress/support/command";
import { waitForSpan } from "@/integration/cypress/support/command/waitForSpan";

export function install(): void {
  const cypressObj = new CypressObj(Cypress);
  const runInfo = new RunInfo(buildFileSpaceFromCypressEnv(cypressObj));
  let currentHook: SpecHook | undefined;

  beforeEach(() => {
    currentHook = runInfo.setCurrentSpec(Cypress.spec);

    currentHook.onBeforeEach();
  });

  afterEach(() => {
    currentHook?.onAfterEach();
    runInfo.reset();
  });

  installCommands(runInfo);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      waitForSpan: typeof waitForSpan;
    }
  }
}
