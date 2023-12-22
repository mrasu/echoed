import { opentelemetry } from "@/generated/otelpbj";
import { isUserAgentInternalProgram } from "@/util/ua";
import { PropagationTestConfig } from "@/config/propagationTestConfig";

const USER_AGENT_ATTRIBUTE_KEYS = new Set(["user-agent", "http.user_agent"]);

export class TobikuraSpan extends opentelemetry.proto.trace.v1.Span {
  public resource?: opentelemetry.proto.resource.v1.Resource | null;
  public scope?: opentelemetry.proto.common.v1.InstrumentationScope | null;

  constructor(
    span: opentelemetry.proto.trace.v1.ISpan,
    resource?: opentelemetry.proto.resource.v1.Resource | null,
    scope?: opentelemetry.proto.common.v1.InstrumentationScope | null,
  ) {
    super(span);
    this.resource = resource || null;
    this.scope = scope || null;
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
    const ignoreAttributes = config.ignoreConfig?.attributes || {};
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
}

function isIgnoredAttribute(
  attributes: opentelemetry.proto.common.v1.IKeyValue[],
  ignoreTargetAttributes: Record<string, string | boolean | number>,
): boolean {
  for (const attr of attributes) {
    const key = attr.key;
    if (!key) continue;

    const ignoreValue = ignoreTargetAttributes[key];
    if (ignoreValue === null || ignoreValue === undefined) continue;

    const val = attr.value;
    if (
      ignoreValue === val?.stringValue ||
      ignoreValue === val?.intValue ||
      ignoreValue === val?.doubleValue ||
      ignoreValue === val?.boolValue
    ) {
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
