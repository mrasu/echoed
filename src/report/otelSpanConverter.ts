import { opentelemetry } from "@/generated/otelpbj";
import { convertAnyValue } from "@/report/otelAnyValueConverter";
import { OtelSpan } from "@/type/otelSpan";
import { toHexString } from "@/util/byte";
import { neverVisit } from "@/util/never";
import {
  IEvent,
  IInstrumentationScope,
  IKeyValue,
  ILink,
  IResource,
  ISpan,
  IStatus,
  SpanKind,
  StatusCode,
} from "@shared/type/echoedParam";

export class OtelSpanConverter {
  static convertAll(spans: OtelSpan[]): ISpan[] {
    return spans.map((span) => new OtelSpanConverter().convert(span));
  }

  convert(span: OtelSpan): ISpan {
    return {
      attributes: this.convertAttributes(span.attributes),
      traceId: toHexString(span.traceId),
      spanId: toHexString(span.spanId),
      parentSpanId: toHexString(span.parentSpanId),
      name: span.name ?? undefined,
      startTimeUnixNano: span.startTimeUnixNano?.toString(),
      endTimeUnixNano: span.endTimeUnixNano?.toString(),
      events: this.convertEvents(span.events),
      links: this.convertLinks(span.links),
      kind: this.convertKind(span.kind),
      status: this.convertStatus(span.status),
      resource: this.convertResource(span.resource),
      scope: this.convertScope(span.scope),
    };
  }

  private convertAttributes(
    attributes: opentelemetry.proto.common.v1.IKeyValue[],
  ): IKeyValue[] {
    return attributes.map(
      (attr): IKeyValue => ({
        key: attr.key ?? undefined,
        value: attr.value ? convertAnyValue(attr.value) : undefined,
      }),
    );
  }

  private convertEvents(
    events: opentelemetry.proto.trace.v1.Span.IEvent[],
  ): IEvent[] {
    return events.map((event): IEvent => {
      return {
        timeUnixNano: event.timeUnixNano?.toString(),
        name: event.name ?? undefined,
        attributes: event.attributes
          ? this.convertAttributes(event.attributes)
          : undefined,
        droppedAttributesCount: event.droppedAttributesCount ?? undefined,
      };
    });
  }

  private convertLinks(
    links: opentelemetry.proto.trace.v1.Span.ILink[],
  ): ILink[] {
    return links.map((link): ILink => {
      return {
        traceId: toHexString(link.traceId),
        spanId: toHexString(link.spanId),
        traceState: link.traceState ?? undefined,
        attributes: link.attributes
          ? this.convertAttributes(link.attributes)
          : undefined,
        droppedAttributesCount: link.droppedAttributesCount ?? undefined,
      };
    });
  }

  private convertKind(
    kind: opentelemetry.proto.trace.v1.Span.SpanKind | null | undefined,
  ): SpanKind | undefined {
    if (kind == null) return undefined;

    switch (kind) {
      case opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_UNSPECIFIED:
        return "SPAN_KIND_UNSPECIFIED";
      case opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_INTERNAL:
        return "SPAN_KIND_INTERNAL";
      case opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_SERVER:
        return "SPAN_KIND_SERVER";
      case opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_CLIENT:
        return "SPAN_KIND_CLIENT";
      case opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_PRODUCER:
        return "SPAN_KIND_PRODUCER";
      case opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_CONSUMER:
        return "SPAN_KIND_CONSUMER";
      default:
        neverVisit("unknown kind", kind);
    }
  }

  private convertStatus(
    status: opentelemetry.proto.trace.v1.IStatus | null | undefined,
  ): IStatus | undefined {
    if (!status) return undefined;

    return {
      message: status.message ?? undefined,
      code: this.convertStatusCode(status.code),
    };
  }

  private convertStatusCode(
    code: opentelemetry.proto.trace.v1.Status.StatusCode | null | undefined,
  ): StatusCode | undefined {
    if (code == null) return undefined;

    switch (code) {
      case opentelemetry.proto.trace.v1.Status.StatusCode.STATUS_CODE_UNSET:
        return "STATUS_CODE_UNSET";
      case opentelemetry.proto.trace.v1.Status.StatusCode.STATUS_CODE_OK:
        return "STATUS_CODE_OK";
      case opentelemetry.proto.trace.v1.Status.StatusCode.STATUS_CODE_ERROR:
        return "STATUS_CODE_ERROR";
      default:
        neverVisit("unknown status code", code);
    }
  }

  private convertResource(
    resource: opentelemetry.proto.resource.v1.IResource | null | undefined,
  ): IResource | undefined {
    if (!resource) return undefined;

    return {
      attributes: resource.attributes
        ? this.convertAttributes(resource.attributes)
        : undefined,
      droppedAttributesCount: resource.droppedAttributesCount ?? undefined,
    };
  }

  private convertScope(
    scope:
      | opentelemetry.proto.common.v1.IInstrumentationScope
      | null
      | undefined,
  ): IInstrumentationScope | undefined {
    if (!scope) return undefined;

    return {
      attributes: scope.attributes
        ? this.convertAttributes(scope.attributes)
        : undefined,
      droppedAttributesCount: scope.droppedAttributesCount ?? undefined,
    };
  }
}
