import { Method } from "@/type/http";
import { OpenAPI } from "openapi-types";

export class Operation {
  constructor(
    // specPath is path specified in OpenAPI specification
    public specPath: string,
    public method: Method,
    public openApiOperation: OpenAPI.Operation,
    public visited: boolean = false,
  ) {}
}
