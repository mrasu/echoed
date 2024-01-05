import {
  IServiceCoverageCollector,
  ServiceCoverageCollectorResult,
} from "@/coverage/iServiceCoverageCollector";
import { OtelSpan } from "@/type/otelSpan";
import {
  Namespace,
  NamespaceBase,
  Root,
  Service as protobufService,
  Type,
} from "protobufjs";
import { opentelemetry } from "@/generated/otelpbj";
import Span = opentelemetry.proto.trace.v1.Span;
import { RpcMethodCoverage } from "@/coverage/coverageResult";
import path from "path";
import { Service } from "@/coverage/proto/service";

export class ProtoCoverageCollector implements IServiceCoverageCollector {
  private services = new Map<string, Service>();

  static buildFromRoot(
    root: Root,
    filename: string,
    targetServices: Set<string> | undefined,
  ): ProtoCoverageCollector {
    const absoluteFilename = path.resolve(filename);
    const services = new Map<string, Service>();

    const inspect = (namespace: NamespaceBase) => {
      if (namespace instanceof protobufService) {
        if (!namespace.filename) return;

        const absoluteNamespaceFilename = path.resolve(namespace.filename);
        if (absoluteNamespaceFilename !== absoluteFilename) return;

        const service = new Service(namespace);
        if (service.isInTargettedService(targetServices)) {
          services.set(service.rpcServiceName, service);
        }
        return;
      }

      for (const child of namespace.nestedArray) {
        if (
          child instanceof Namespace ||
          child instanceof Root ||
          child instanceof protobufService ||
          child instanceof Type
        ) {
          inspect(child);
        }
      }
    };
    inspect(root);

    return new ProtoCoverageCollector(services);
  }

  constructor(services: Map<string, Service>) {
    this.services = services;
  }

  markVisited(spans: OtelSpan[]): void {
    for (const span of spans) {
      // Ignore Client span as it is not related to "this" service's coverage
      if (span.kind === Span.SpanKind.SPAN_KIND_CLIENT) continue;

      const rpcService = span.getAttribute("rpc.service")?.value?.stringValue;
      if (!rpcService) continue;

      const rpcMethod = span.getAttribute("rpc.method")?.value?.stringValue;
      if (!rpcMethod) continue;

      const method = this.services.get(rpcService)?.methods.get(rpcMethod);
      if (!method) continue;

      method.visited = true;
    }
  }

  getCoverage(): ServiceCoverageCollectorResult {
    const coverages: RpcMethodCoverage[] = [];
    for (const [serviceName, service] of this.services.entries()) {
      for (const [methodName, method] of service.methods.entries()) {
        coverages.push({
          service: serviceName,
          method: methodName,
          passed: method.visited,
        });
      }
    }

    return {
      rpcCoverage: {
        methodCoverages: coverages,
      },
    };
  }
}
