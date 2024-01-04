import { opentelemetry } from "@/generated/otelpbj";
import { isUserAgentInternalProgram } from "@/util/ua";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { Comparable } from "@/comparision/comparable";
import { hasValue } from "@/util/type";
import IKeyValue = opentelemetry.proto.common.v1.IKeyValue;

const USER_AGENT_ATTRIBUTE_KEYS = new Set(["user-agent", "http.user_agent"]);
const DEFAULT_SERVICE_NAME = "unknown";

export class OtelSpan extends opentelemetry.proto.trace.v1.Span {
  public resource?: opentelemetry.proto.resource.v1.Resource | null;
  public scope?: opentelemetry.proto.common.v1.InstrumentationScope | null;

  private readonly attributeMap: Map<string, IKeyValue> = new Map();
  private readonly resourceAttributeMap: Map<string, IKeyValue> = new Map();

  constructor(
    span: opentelemetry.proto.trace.v1.ISpan,
    resource?: opentelemetry.proto.resource.v1.Resource | null,
    scope?: opentelemetry.proto.common.v1.InstrumentationScope | null,
  ) {
    super(span);
    this.resource = resource || null;
    this.scope = scope || null;

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

  public toJSON() {
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
    const ignoreAttributes = config.ignoreConfig.attributes;
    if (isIgnoredAttribute(this.attributes, ignoreAttributes)) {
      return true;
    }

    if (this.resource) {
      const ignores = config.ignoreConfig?.attributes || {};
      if (isIgnoredAttribute(this.resource.attributes, ignores)) {
        return true;
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

function isIgnoredAttribute(
  attributes: IKeyValue[],
  ignoreTargets: Map<string, Comparable>,
): boolean {
  for (const attr of attributes) {
    const key = attr.key;
    if (!key) continue;

    const ignoreComparable = ignoreTargets.get(key);
    if (!ignoreComparable) continue;

    const val = attr.value;
    if (ignoreComparable.matchIAnyValue(val)) {
      return true;
    }

    const lowerKey = key.toLowerCase();
    if (USER_AGENT_ATTRIBUTE_KEYS.has(lowerKey)) {
      const userAgent = val?.stringValue;
      if (!userAgent) continue;

      if (!isUserAgentInternalProgram(userAgent)) {
        return true;
      }
    }
  }

  return false;
}
