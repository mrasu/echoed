import { HttpCoverage, RpcCoverage } from "@/coverage/coverageResult";
import { OtelSpan } from "@/type/otelSpan";

export interface ServiceCoverageCollector {
  markVisited(spans: OtelSpan[]): void;
  getCoverage(): ServiceCoverageCollectorResult;
}

export type ServiceCoverageCollectorResult = {
  httpCoverage?: HttpCoverage;
  rpcCoverage?: RpcCoverage;
};
