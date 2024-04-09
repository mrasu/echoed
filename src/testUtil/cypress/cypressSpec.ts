const DEFAULT_SPEC: Cypress.Spec = {
  absolute: "/path/to/spec.ts",
  name: "spec.ts",
  relative: "spec.ts",
};

export function buildCypressSpec(
  overrides: Partial<Cypress.Spec> = {},
): Cypress.Spec {
  return {
    ...DEFAULT_SPEC,
    ...overrides,
  };
}
