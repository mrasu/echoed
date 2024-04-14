import { HexString } from "@/type/hexString";
import { HttpMethod } from "@shared/type/http";

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
  method: HttpMethod;
  passed: boolean;
};

export type HttpOperationTraces = {
  path: string;
  method: HttpMethod;
  traceIds: HexString[];
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
  traceIds: HexString[];
};
