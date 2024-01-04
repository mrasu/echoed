import { OpenAPIV3 } from "openapi-types";

const DEFAULT_V3_DOC: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "dummy",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:8080/api",
    },
  ],
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

export function buildV3Document(
  overrides: Partial<OpenAPIV3.Document> = {},
): OpenAPIV3.Document {
  return {
    ...DEFAULT_V3_DOC,
    ...overrides,
  };
}
