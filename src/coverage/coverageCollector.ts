import { Coverage, CoverageResult } from "@/coverage/coverageResult";
import { IServiceCoverageCollector } from "@/coverage/iServiceCoverageCollector";
import { UnmeasuredTraceCollector } from "@/coverage/unmeasuredTraceCollector";
import { OtelSpan } from "@/type/otelSpan";
import { TwoKeyValuesMap } from "@/util/twoKeyValuesMap";

export class CoverageCollector {
  private readonly serviceCollectors: ServiceMap<IServiceCoverageCollector> =
    new ServiceMap();
  private unmeasuredCollector = new ServiceMap<UnmeasuredTraceCollector>();

  constructor() {}

  add(
    serviceName: string,
    serviceNamespace: string | undefined,
    collector: IServiceCoverageCollector,
  ): void {
    this.serviceCollectors.set(serviceName, serviceNamespace, collector);
  }

  markVisited(spans: OtelSpan[]): void {
    const serviceSpans = new ServiceMap<OtelSpan[]>();
    for (const span of spans) {
      const serviceName = span.serviceName;
      const serviceNamespace = span.serviceNamespace;

      serviceSpans.initOr(serviceName, serviceNamespace, [span], (v) => {
        v.push(span);
      });
    }

    for (const [
      serviceName,
      serviceNamespace,
      spans,
    ] of serviceSpans.entries()) {
      const collector = this.serviceCollectors.get(
        serviceName,
        serviceNamespace,
      );
      if (!collector) {
        this.markAsUnmeasured(serviceName, serviceNamespace, spans);
        continue;
      }

      collector.markVisited(spans);
    }
  }

  private markAsUnmeasured(
    service: string,
    namespace: string | undefined,
    spans: OtelSpan[],
  ): void {
    let collector = this.unmeasuredCollector.get(service, namespace);
    if (!collector) {
      collector = new UnmeasuredTraceCollector();
      this.unmeasuredCollector.set(service, namespace, collector);
    }

    collector.addSpans(spans);
  }

  getCoverage(): CoverageResult {
    const coverages = this.getCoverages();
    const unmeasuredCoverages = this.getUnmeasuredCoverages();

    return new CoverageResult(coverages.concat(unmeasuredCoverages));
  }

  private getCoverages(): Coverage[] {
    return this.serviceCollectors
      .entries()
      .map(([serviceName, serviceNamespace, collector]) => {
        const collectorCoverage = collector.getCoverage();
        return {
          serviceName,
          serviceNamespace,
          httpCoverage: collectorCoverage.httpCoverage,
          rpcCoverage: collectorCoverage.rpcCoverage,
          unmeasuredTraceIds: undefined,
        };
      });
  }

  private getUnmeasuredCoverages(): Coverage[] {
    return this.unmeasuredCollector
      .entries()
      .map(([serviceName, serviceNamespace, collector]) => {
        return {
          serviceName,
          serviceNamespace,
          unmeasuredTraceIds: collector.traceIdArray,
        };
      });
  }
}

class ServiceMap<T> extends TwoKeyValuesMap<string, string | undefined, T> {}
