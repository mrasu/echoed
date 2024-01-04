import { OtelSpan } from "@/type/otelSpan";
import { opentelemetry } from "@/generated/otelpbj";

describe("OtelSpan", () => {
  describe("serviceName", () => {
    describe("when resource is not set", () => {
      it("should be default service name", () => {
        const span = new OtelSpan({});
        expect(span.serviceName).toBe("unknown");
      });
    });

    describe("when resource exists but no `service.name` attribute", () => {
      it("should be default service name", () => {
        const span = new OtelSpan(
          {},
          new opentelemetry.proto.resource.v1.Resource({
            attributes: [
              {
                key: "foo.bar",
                value: {
                  stringValue: "test",
                },
              },
            ],
          }),
        );
        expect(span.serviceName).toBe("unknown");
      });
    });

    describe("when `service.name` in resource attribute", () => {
      it("should be default service name", () => {
        const span = new OtelSpan(
          {},
          new opentelemetry.proto.resource.v1.Resource({
            attributes: [
              {
                key: "service.name",
                value: {
                  stringValue: "test",
                },
              },
            ],
          }),
        );
        expect(span.serviceName).toBe("test");
      });
    });
  });

  describe("serviceNamespace", () => {
    describe("when resource is not set", () => {
      it("should be undefined", () => {
        const span = new OtelSpan({});
        expect(span.serviceNamespace).not.toBeDefined();
      });
    });

    describe("when resource exists but no `service.namespace` attribute", () => {
      it("should set default service name", () => {
        const span = new OtelSpan(
          {},
          new opentelemetry.proto.resource.v1.Resource({
            attributes: [
              {
                key: "foo.bar",
                value: {
                  stringValue: "test",
                },
              },
            ],
          }),
        );
        expect(span.serviceNamespace).not.toBeDefined();
      });
    });

    describe("when `service.name` in resource attribute", () => {
      it("should set default service name", () => {
        const span = new OtelSpan(
          {},
          new opentelemetry.proto.resource.v1.Resource({
            attributes: [
              {
                key: "service.namespace",
                value: {
                  stringValue: "test",
                },
              },
            ],
          }),
        );
        expect(span.serviceNamespace).toBe("test");
      });
    });
  });

  describe("getAttribute", () => {
    describe("when attribute is not set", () => {
      it("should return undefined", () => {
        const span = new OtelSpan({});
        expect(span.getAttribute("a.b")).not.toBeDefined();
      });
    });

    describe("when attribute exists", () => {
      it("should return key-value of specified key", () => {
        const span = new OtelSpan({
          attributes: [
            {
              key: "foo.bar",
              value: {
                stringValue: "test",
              },
            },
          ],
        });
        const attr = span.getAttribute("foo.bar");
        expect(attr?.key).toBe("foo.bar");
        expect(attr?.value?.stringValue).toBe("test");
      });
    });
  });

  describe("getResourceAttribute", () => {
    describe("when resource attribute is not set", () => {
      it("should return undefined", () => {
        const span = new OtelSpan({});
        expect(span.getResourceAttribute("a.b")).not.toBeDefined();
      });
    });

    describe("when resource attribute exists", () => {
      it("should return key-value of specified key", () => {
        const span = new OtelSpan(
          {},
          new opentelemetry.proto.resource.v1.Resource({
            attributes: [
              {
                key: "foo.bar",
                value: {
                  stringValue: "test",
                },
              },
            ],
          }),
        );
        const attr = span.getResourceAttribute("foo.bar");
        expect(attr?.key).toBe("foo.bar");
        expect(attr?.value?.stringValue).toBe("test");
      });
    });
  });
});
