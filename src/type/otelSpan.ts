import {
  PropagationTestConfig,
  PropagationTestIgnoreConditionConfig,
} from "@/config/propagationTestConfig";
import { opentelemetry } from "@/generated/otelpbj";
import { hasValue } from "@/util/type";
import { isUserAgentInternalProgram } from "@/util/ua";
import Span = opentelemetry.proto.trace.v1.Span;
import IKeyValue = opentelemetry.proto.common.v1.IKeyValue;
import Resource = opentelemetry.proto.resource.v1.Resource;
import InstrumentationScope = opentelemetry.proto.common.v1.InstrumentationScope;

const USER_AGENT_ATTRIBUTE_KEYS = new Set(["user-agent", "http.user_agent"]);
const DEFAULT_SERVICE_NAME = "unknown";

export type JsonOtelSpan = opentelemetry.proto.trace.v1.ISpan & {
  resource: opentelemetry.proto.resource.v1.IResource;
  scope: opentelemetry.proto.common.v1.IInstrumentationScope;
};

export class OtelSpan extends Span {
  public resource?: opentelemetry.proto.resource.v1.Resource | null;
  public scope?: opentelemetry.proto.common.v1.InstrumentationScope | null;

  private readonly attributeMap: Map<string, IKeyValue> = new Map();
  private readonly resourceAttributeMap: Map<string, IKeyValue> = new Map();

  static fromObjects(spans: JsonOtelSpan[]): OtelSpan[] {
    return spans.map(
      (span) => new OtelSpan(Span.fromObject(span), span.resource, span.scope),
    );
  }

  constructor(
    span: opentelemetry.proto.trace.v1.ISpan,
    resource?: opentelemetry.proto.resource.v1.IResource | null,
    scope?: opentelemetry.proto.common.v1.IInstrumentationScope | null,
  ) {
    super(span);
    this.resource = resource ? Resource.fromObject(resource) : null;
    this.scope = scope ? InstrumentationScope.fromObject(scope) : null;

    for (const attr of this.attributes) {
      const key = attr.key;
      if (hasValue(key)) {
        this.attributeMap.set(key, attr);
      }
    }

    if (this.resource) {
      for (const attr of this.resource.attributes) {
        const key = attr.key;
        if (hasValue(key)) {
          this.resourceAttributeMap.set(key, attr);
        }
      }
    }
  }

  public override toJSON(): Record<string, unknown> {
    const v = super.toJSON();
    v["resource"] = this.resource?.toJSON();
    v["scope"] = this.scope?.toJSON();

    return v;
  }

  get isRoot(): boolean {
    if (!this.parentSpanId) return true;
    if (this.parentSpanId.byteLength === 0) return true;

    return false;
  }

  shouldIgnoreFromPropagationTest(config: PropagationTestConfig): boolean {
    for (const condition of config.ignoreConditions) {
      if (this.matchesIgnoreCondition(condition)) {
        return true;
      }
    }

    if (this.isIgnoredUserAgentSpan()) {
      return true;
    }

    return false;
  }

  private matchesIgnoreCondition(
    condition: PropagationTestIgnoreConditionConfig,
  ): boolean {
    for (const [key, comparable] of condition.attributes) {
      const attrValue = this.getAttribute(key);
      if (!attrValue) return false;

      if (!comparable.matchIAnyValue(attrValue.value)) {
        return false;
      }
    }

    for (const [key, comparable] of condition.resource.attributes) {
      const attrValue = this.getResourceAttribute(key);
      if (!attrValue) return false;

      if (!comparable.matchIAnyValue(attrValue.value)) {
        return false;
      }
    }

    return true;
  }

  private isIgnoredUserAgentSpan(): boolean {
    for (const key of this.attributes) {
      if (!key.key) continue;

      const lowerKey = key.key.toLowerCase();
      if (USER_AGENT_ATTRIBUTE_KEYS.has(lowerKey)) {
        const userAgent = key.value?.stringValue;
        if (!userAgent) continue;

        if (!isUserAgentInternalProgram(userAgent)) {
          return true;
        }
      }
    }

    return false;
  }

  getAttribute(key: string): IKeyValue | undefined {
    return this.attributeMap.get(key);
  }

  get serviceName(): string {
    return (
      this.getResourceAttribute("service.name")?.value?.stringValue ??
      DEFAULT_SERVICE_NAME
    );
  }

  get serviceNamespace(): string | undefined {
    return (
      this.getResourceAttribute("service.namespace")?.value?.stringValue ??
      undefined
    );
  }

  getResourceAttribute(key: string): IKeyValue | undefined {
    return this.resourceAttributeMap.get(key);
  }
}
