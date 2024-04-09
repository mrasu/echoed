import { ICypressObj } from "@/integration/cypress/internal/infra/iCypressObj";

export class CypressObj implements ICypressObj {
  constructor(private c: Cypress.Cypress) {}

  env(key: string): unknown {
    return this.c.env(key);
  }
}
