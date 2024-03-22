import { Eq } from "@/comparision/eq";
import { OpenApiConfig } from "@/config/config";

const DEFAULT_CONFIG: OpenApiConfig = {
  filePath: "dummy.yaml",
  coverage: {
    undocumentedOperation: {
      ignores: [
        {
          path: new Eq("/ignored"),
          method: "post",
        },
      ],
    },
  },
};

export function buildOpenApiConfig(
  overrides: Partial<OpenApiConfig> = {},
): OpenApiConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
  };
}
