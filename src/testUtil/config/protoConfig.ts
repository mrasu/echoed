import { ProtoConfig } from "@/config/config";

const DEFAULT_CONFIG: ProtoConfig = {
  filePath: "dummy.proto",
  coverage: {
    undocumentedMethod: {
      ignores: [],
    },
  },
};

export function buildProtoConfig(
  overrides: Partial<ProtoConfig> = {},
): ProtoConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
  };
}
