import { Service } from "@/coverage/proto/service";
import { Root, Service as ProtobufService } from "protobufjs";

describe("Service", () => {
  const root = Root.fromJSON({
    nested: {
      MyPackage: {
        nested: {
          CartService: {
            methods: {},
          },
        },
      },
    },
  });
  const protobufService = root.lookupService("CartService");

  describe("rpcServiceName", () => {
    it("should return service name without leading dot", () => {
      const service = new Service(protobufService);

      expect(protobufService.fullName).toBe(".MyPackage.CartService");
      expect(service.rpcServiceName).toBe("MyPackage.CartService");
    });
  });

  describe("isInTargettedService", () => {
    describe("when targetServices is undefined", () => {
      it("should return true", () => {
        const service = new Service(protobufService);

        expect(service.isInTargettedService(undefined)).toBe(true);
      });
    });

    describe("when targetServices doesn't have package name", () => {
      it("should return true", () => {
        const service = new Service(protobufService);

        expect(service.isInTargettedService(new Set(["CartService"]))).toBe(
          true,
        );
      });
    });

    describe("when targetServices have package name", () => {
      it("should return true", () => {
        const service = new Service(protobufService);

        expect(
          service.isInTargettedService(new Set(["MyPackage.CartService"])),
        ).toBe(true);
      });
    });

    describe("when targetServices doesn't match", () => {
      it("should return false", () => {
        const service = new Service(protobufService);

        expect(service.isInTargettedService(new Set(["foo.bar"]))).toBe(false);
      });
    });
  });
});
