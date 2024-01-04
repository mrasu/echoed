import { OtelSpan } from "@/type/otelSpan";
import { Coverage, CoverageResult } from "@/coverage/coverageResult";
import { IServiceCoverageCollector } from "@/coverage/iServiceCoverageCollector";

export class CoverageCollector {
  private readonly serviceCollectors: ServiceMap<IServiceCoverageCollector> =
    new ServiceMap();

  constructor() {}

  add(
    serviceName: string,
    serviceNamespace: string | undefined,
    collector: IServiceCoverageCollector,
  ) {
    this.serviceCollectors.set(serviceName, serviceNamespace, collector);
  }

  markVisited(spans: OtelSpan[]) {
    const serviceSpans = new ServiceMap<OtelSpan[]>();
    for (const span of spans) {
      const serviceName = span.serviceName;
      const serviceNamespace = span.serviceNamespace;
      let spans = serviceSpans.get(serviceName, serviceNamespace);
      if (!spans) {
        spans = [span];
        serviceSpans.set(serviceName, serviceNamespace, spans);
      } else {
        spans.push(span);
      }
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
      if (!collector) continue;

      collector.markVisited(spans);
    }
  }

  getCoverage(): CoverageResult {
    const coverages: Coverage[] = [];
    for (const [
      serviceName,
      serviceNamespace,
      collector,
    ] of this.serviceCollectors.entries()) {
      const collectorCoverage = collector.getCoverage();
      coverages.push({
        serviceName,
        serviceNamespace,
        http: collectorCoverage.httpCoverage,
      });
    }

    return new CoverageResult(coverages);
  }
}

class ServiceMap<T> {
  // serviceNamespaceKeyMap is Map<serviceName, Map<namespace, T>>
  private readonly serviceNamespaceKeyMap: Map<
    string,
    Map<string | undefined, T>
  > = new Map();

  set(serviceName: string, namespace: string | undefined, value: T) {
    let namespaceMap = this.serviceNamespaceKeyMap.get(serviceName);
    if (!namespaceMap) {
      namespaceMap = new Map([[namespace, value]]);
      this.serviceNamespaceKeyMap.set(serviceName, namespaceMap);
    } else {
      namespaceMap.set(namespace, value);
    }
  }

  get(service: string, namespace: string | undefined): T | undefined {
    const namespaceMap = this.serviceNamespaceKeyMap.get(service);
    if (!namespaceMap) return undefined;
    return namespaceMap.get(namespace);
  }

  entries(): [string, string | undefined, T][] {
    const ret: [string, string | undefined, T][] = [];
    for (const [
      serviceName,
      namespaceMap,
    ] of this.serviceNamespaceKeyMap.entries()) {
      for (const [namespace, collector] of namespaceMap.entries()) {
        ret.push([serviceName, namespace, collector]);
      }
    }

    return ret;
  }
}
