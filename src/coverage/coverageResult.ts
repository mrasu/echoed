import { Method } from "@/type/http";

export class CoverageResult {
  constructor(public readonly coverages: Coverage[]) {}
}

export type Coverage = {
  serviceName: string;
  serviceNamespace: string | undefined;
  http: HttpCoverage;
};

export type HttpCoverage = {
  operationCoverages: HttpOperationCoverage[];
};

export type HttpOperationCoverage = {
  path: string;
  method: Method;
  passed: boolean;
};
