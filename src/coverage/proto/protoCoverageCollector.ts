import { ProtoConfig } from "@/config/config";
import { RpcMethodCoverage } from "@/coverage/coverageResult";
import { Service } from "@/coverage/proto/service";
import { SpanCollector } from "@/coverage/proto/spanCollector";
import {
  ServiceCoverageCollector,
  ServiceCoverageCollectorResult,
} from "@/coverage/serviceCoverageCollector";
import { opentelemetry } from "@/generated/otelpbj";
import { OtelSpan } from "@/type/otelSpan";
import path from "path";
import {
  Namespace,
  NamespaceBase,
  Root,
  Type,
  Service as protobufService,
} from "protobufjs";
import Span = opentelemetry.proto.trace.v1.Span;

export class ProtoCoverageCollector implements ServiceCoverageCollector {
  static buildFromRoot(
    config: ProtoConfig,
    root: Root,
    filename: string,
    targetServices: Set<string> | undefined,
  ): ProtoCoverageCollector {
    const absoluteFilename = path.resolve(filename);
    const services = new Map<string, Service>();

    const inspect = (namespace: NamespaceBase): void => {
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

    const undocumentedSpanCollector = new SpanCollector(
      config.coverage?.undocumentedMethod.ignores ?? [],
    );
    return new ProtoCoverageCollector(services, undocumentedSpanCollector);
  }

  constructor(
    private services: Map<string, Service>,
    private undocumentedSpanCollector: SpanCollector,
  ) {}

  markVisited(spans: OtelSpan[]): void {
    for (const span of spans) {
      // Ignore Client span as it is not related to "this" service's coverage
      if (span.kind === Span.SpanKind.SPAN_KIND_CLIENT) continue;

      const rpcService = span.getAttribute("rpc.service")?.value?.stringValue;
      if (!rpcService) continue;

      const rpcMethod = span.getAttribute("rpc.method")?.value?.stringValue;
      if (!rpcMethod) continue;

      const method = this.services.get(rpcService)?.methods.get(rpcMethod);
      if (!method) {
        this.addUndocumented(rpcService, rpcMethod, span);
        continue;
      }

      method.visited = true;
    }
  }

  addUndocumented(rpcService: string, rpcMethod: string, span: OtelSpan): void {
    this.undocumentedSpanCollector.add(rpcService, rpcMethod, [span]);
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
        undocumentedMethods: this.undocumentedSpanCollector.toRpcMethodTraces(),
      },
    };
  }
}
