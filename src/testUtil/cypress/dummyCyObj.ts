import { ICypressObj } from "@/integration/cypress/internal/infra/iCypressObj";

export class DummyCyObj implements ICypressObj {
  private readonly envs: Record<string, string>;
  constructor({ envs }: { envs?: Record<string, string> } = {}) {
    this.envs = envs ?? {};
  }

  env(key: string): string | undefined {
    return this.envs[key];
  }
}
