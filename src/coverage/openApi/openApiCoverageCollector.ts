import { OpenApiConfig } from "@/config/config";
import { HttpOperationCoverage } from "@/coverage/coverageResult";
import { OperationTree } from "@/coverage/openApi/operationTree";
import { SpanCollector } from "@/coverage/openApi/spanCollector";
import {
  ServiceCoverageCollector,
  ServiceCoverageCollectorResult,
} from "@/coverage/serviceCoverageCollector";
import { opentelemetry } from "@/generated/otelpbj";
import { Method, toMethod } from "@/type/http";
import { OtelSpan } from "@/type/otelSpan";
import { TwoKeyValuesMap } from "@/util/twoKeyValuesMap";
import { removeQueryAndHashFromPath } from "@/util/url";
import { OpenAPI } from "openapi-types";
import Span = opentelemetry.proto.trace.v1.Span;

export class OpenApiCoverageCollector implements ServiceCoverageCollector {
  static buildFromDocument(
    config: OpenApiConfig,
    document: OpenAPI.Document,
  ): OpenApiCoverageCollector {
    const pathTree = OperationTree.buildFromDocument(document);
    const undocumentedSpanCollector = new SpanCollector(
      config.coverage?.undocumentedOperation.ignores ?? [],
    );

    return new OpenApiCoverageCollector(pathTree, undocumentedSpanCollector);
  }

  constructor(
    private pathTree: OperationTree,
    private undocumentedSpanCollector: SpanCollector,
  ) {}

  markVisited(spans: OtelSpan[]): void {
    const paths = new TwoKeyValuesMap<string, Method, OtelSpan[]>();
    for (const span of spans) {
      // Ignore Client span as it is not related to "this" service's coverage
      if (span.kind === Span.SpanKind.SPAN_KIND_CLIENT) continue;

      const path = this.extractHttpPath(span);
      if (!path) continue;

      const method = this.extractHttpMethod(span);
      if (!method) continue;

      paths.initOr(path, method, [span], (v) => {
        v.push(span);
      });
    }

    for (const [path, method, spans] of paths.entries()) {
      const operation = this.pathTree.get(path, method);
      if (operation) {
        operation.visited = true;
      } else {
        this.undocumentedSpanCollector.add(path, method, spans);
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
        undocumentedOperations:
          this.undocumentedSpanCollector.toHttpOperationTraces(),
      },
    };
  }
}
