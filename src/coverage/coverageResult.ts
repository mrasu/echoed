import { Method } from "@/type/http";

export class CoverageResult {
  constructor(public readonly coverages: Coverage[]) {}
}

export type Coverage = {
  serviceName: string;
  serviceNamespace: string | undefined;
  httpCoverage?: HttpCoverage;
  rpcCoverage?: RpcCoverage;
};

export type HttpCoverage = {
  operationCoverages: HttpOperationCoverage[];
};

export type HttpOperationCoverage = {
  path: string;
  method: Method;
  passed: boolean;
};

export type RpcCoverage = {
  methodCoverages: RpcMethodCoverage[];
};

export type RpcMethodCoverage = {
  service: string;
  method: string;
  passed: boolean;
};
