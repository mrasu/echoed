import { opentelemetry } from "./../generated/otelpbj";

export class TobikuraSpan extends opentelemetry.proto.trace.v1.Span {
  public resource?: opentelemetry.proto.resource.v1.Resource | null;
  public scope?: opentelemetry.proto.common.v1.InstrumentationScope | null;

  constructor(span: opentelemetry.proto.trace.v1.ISpan, resource?: opentelemetry.proto.resource.v1.Resource | null, scope?: opentelemetry.proto.common.v1.InstrumentationScope | null) {
    super(span);
    this.resource = resource || null;
    this.scope = scope || null;
  }

  public toJSON() {
    const v = super.toJSON()
    v["resource"] = this.resource?.toJSON()
    v["scope"] = this.scope?.toJSON()

    return v
  }
}
