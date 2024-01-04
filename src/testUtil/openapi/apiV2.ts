import { OpenAPIV2 } from "openapi-types";

const DEFAULT_V2_DOC: OpenAPIV2.Document = {
  swagger: "2.0",
  info: {
    title: "dummy",
    version: "1.0.0",
  },
  basePath: "/api",
  paths: {
    "/users": {
      get: {
        responses: {},
      },
      post: {
        responses: {},
      },
    },
  },
};

export function buildV2Document(
  overrides: Partial<OpenAPIV2.Document> = {},
): OpenAPIV2.Document {
  return {
    ...DEFAULT_V2_DOC,
    ...overrides,
  };
}
