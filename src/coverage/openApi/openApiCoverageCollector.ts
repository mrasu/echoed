import { OperationTree } from "@/coverage/openApi/operationTree";
import { OtelSpan } from "@/type/otelSpan";
import { removeQueryAndHashFromPath } from "@/util/url";
import { Method, toMethod } from "@/type/http";
import { OpenAPI } from "openapi-types";
import {
  IServiceCoverageCollector,
  ServiceCoverageCollectorResult,
} from "@/coverage/iServiceCoverageCollector";
import { HttpOperationCoverage } from "@/coverage/coverageResult";
import { opentelemetry } from "@/generated/otelpbj";
import Span = opentelemetry.proto.trace.v1.Span;

export class OpenApiCoverageCollector implements IServiceCoverageCollector {
  static async buildFromDocument(
    document: OpenAPI.Document,
  ): Promise<OpenApiCoverageCollector> {
    const pathTree = OperationTree.buildFromDocument(document);

    return new OpenApiCoverageCollector(pathTree);
  }

  constructor(private pathTree: OperationTree) {}

  markVisited(spans: OtelSpan[]) {
    const paths = new Map<string, Set<Method>>();
    for (const span of spans) {
      // Ignore Client span as it is not related to "this" service's coverage
      if (span.kind === Span.SpanKind.SPAN_KIND_CLIENT) continue;

      const path = this.extractHttpPath(span);
      if (!path) continue;

      const method = this.extractHttpMethod(span);
      if (!method) continue;

      const methods = paths.get(path);
      if (methods) {
        methods.add(method);
      } else {
        const methodSet = new Set<Method>([method]);
        paths.set(path, methodSet);
      }
    }

    for (const [url, methods] of paths) {
      for (const method of methods) {
        const operation = this.pathTree.get(url, method);
        if (operation) {
          operation.visited = true;
        }
      }
    }
  }

  private extractHttpPath(span: OtelSpan): string | undefined {
    const urlPath = span.getAttribute("url.path")?.value?.stringValue;
    if (urlPath) {
      return urlPath;
    }
    const httpTarget = span.getAttribute("http.target")?.value?.stringValue;
    if (!httpTarget) return;

    return removeQueryAndHashFromPath(httpTarget);
  }

  private extractHttpMethod(span: OtelSpan): Method | undefined {
    let attribute = span.getAttribute("http.request.method");
    if (!attribute) {
      attribute = span.getAttribute("http.method");
    }
    const attrValueMethod = attribute?.value?.stringValue;
    const method = toMethod(attrValueMethod ?? "GET");
    return method;
  }

  getCoverage(): ServiceCoverageCollectorResult {
    const coverages: HttpOperationCoverage[] = [];
    this.pathTree.visitOperations((operation) => {
      coverages.push({
        path: operation.specPath,
        method: operation.method,
        passed: operation.visited,
      });
    });

    return {
      httpCoverage: {
        operationCoverages: coverages,
      },
    };
  }
}
