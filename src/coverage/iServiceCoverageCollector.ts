import { OtelSpan } from "@/type/otelSpan";
import { HttpCoverage } from "@/coverage/coverageResult";

export interface IServiceCoverageCollector {
  markVisited(spans: OtelSpan[]): void;
  getCoverage(): ServiceCoverageCollectorResult;
}

export type ServiceCoverageCollectorResult = {
  httpCoverage: HttpCoverage;
};
