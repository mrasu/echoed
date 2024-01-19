import { OperationTree } from "@/coverage/openApi/operationTree";
import { OtelSpan } from "@/type/otelSpan";
import { removeQueryAndHashFromPath } from "@/util/url";
import { Method, toMethod } from "@/type/http";
import { OpenAPI } from "openapi-types";
import {
  IServiceCoverageCollector,
  ServiceCoverageCollectorResult,
} from "@/coverage/iServiceCoverageCollector";
import {
  HttpOperationCoverage,
  HttpOperationTraces,
} from "@/coverage/coverageResult";
import { opentelemetry } from "@/generated/otelpbj";
import Span = opentelemetry.proto.trace.v1.Span;
import { TwoKeyValuesMap } from "@/util/twoKeyValuesMap";
import { toBase64 } from "@/util/byte";

export class OpenApiCoverageCollector implements IServiceCoverageCollector {
  // undocumentedOperations is Map<path, Map<method, OtelSpan[]>>
  private undocumentedOperations = new TwoKeyValuesMap<
    string,
    Method,
    OtelSpan[]
  >();

  static buildFromDocument(
    document: OpenAPI.Document,
  ): OpenApiCoverageCollector {
    const pathTree = OperationTree.buildFromDocument(document);

    return new OpenApiCoverageCollector(pathTree);
  }

  constructor(private pathTree: OperationTree) {}

  markVisited(spans: OtelSpan[]) {
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
        this.undocumentedOperations.initOr(path, method, spans, (v) => {
          v.push(...spans);
        });
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

    const undocumentedOperations: HttpOperationTraces[] = [];
    for (const [path, method, spans] of this.undocumentedOperations.entries()) {
      const traceIds = spans
        .filter((span) => span.traceId)
        .map((span) => toBase64(span.traceId));

      undocumentedOperations.push({
        path,
        method,
        traceIds: traceIds,
      });
    }

    return {
      httpCoverage: {
        operationCoverages: coverages,
        undocumentedOperations: undocumentedOperations,
      },
    };
  }
}
