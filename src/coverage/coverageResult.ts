import { Method } from "@/type/http";
import { Base64String } from "@/type/base64String";

export class CoverageResult {
  constructor(public readonly coverages: Coverage[]) {}
}

export type Coverage = {
  serviceName: string;
  serviceNamespace: string | undefined;
  httpCoverage?: HttpCoverage;
  rpcCoverage?: RpcCoverage;

  unmeasuredTraceIds?: string[];
};

export type HttpCoverage = {
  operationCoverages: HttpOperationCoverage[];
  undocumentedOperations: HttpOperationTraces[];
};

export type HttpOperationCoverage = {
  path: string;
  method: Method;
  passed: boolean;
};

export type HttpOperationTraces = {
  path: string;
  method: Method;
  traceIds: Base64String[];
};

export type RpcCoverage = {
  methodCoverages: RpcMethodCoverage[];
  undocumentedMethods: RpcMethodTraces[];
};

export type RpcMethodCoverage = {
  service: string;
  method: string;
  passed: boolean;
};

export type RpcMethodTraces = {
  service: string;
  method: string;
  traceIds: Base64String[];
};
