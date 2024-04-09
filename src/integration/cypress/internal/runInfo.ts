import { FileSpace } from "@/fileSpace/fileSpace";
import { CypressFileLogger } from "@/integration/cypress/internal/infra/cypressFileLogger";
import { SpecHook } from "@/integration/cypress/internal/specHook";

export class RunInfo {
  fileLogger: CypressFileLogger;
  currentSpec: Cypress.Spec | undefined;

  constructor(fileSpace: FileSpace) {
    const file = fileSpace.createTestLogFile();

    this.fileLogger = new CypressFileLogger(file);
  }

  reset(): void {
    this.currentSpec = undefined;
  }

  setCurrentSpec(spec: Cypress.Spec): SpecHook {
    this.currentSpec = spec;

    return new SpecHook(spec, this.fileLogger);
  }
}
