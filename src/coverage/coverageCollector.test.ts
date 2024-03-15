import { CoverageCollector } from "@/coverage/coverageCollector";
import { CoverageResult } from "@/coverage/coverageResult";
import { buildConfig } from "@/testUtil/config/config";
import path from "path";

describe("CoverageCollector", () => {
  describe("createWithServiceInfo", () => {
    it("should create a CoverageCollector with the correct service collectors", async () => {
      const config = buildConfig({
        serviceConfigs: [
          {
            name: "CartService",
            namespace: "myPackage",
            proto: {
              filePath: path.join(__dirname, "proto/__fixtures__/simple.proto"),
              services: ["myPackage.CartService"],
            },
          },
          {
            name: "FrontendService",
            openapi: {
              filePath: path.join(
                __dirname,
                "openApi/__fixtures__/simple.yaml",
              ),
            },
          },
        ],
      });

      const coverageCollector =
        await CoverageCollector.createWithServiceInfo(config);
      const coverageResult = coverageCollector.getCoverage();

      expect(coverageResult).toEqual(
        new CoverageResult([
          {
            serviceName: "CartService",
            serviceNamespace: "myPackage",
            httpCoverage: undefined,
            rpcCoverage: {
              methodCoverages: [
                {
                  service: "myPackage.CartService",
                  method: "AddItem",
                  passed: false,
                },
                {
                  service: "myPackage.CartService",
                  method: "GetCart",
                  passed: false,
                },
              ],
              undocumentedMethods: [],
            },
          },
          {
            serviceName: "FrontendService",
            serviceNamespace: undefined,
            httpCoverage: {
              operationCoverages: [
                {
                  method: "get",
                  path: "/products",
                  passed: false,
                },
                {
                  method: "get",
                  path: "/products/{productId}",
                  passed: false,
                },
              ],
              undocumentedOperations: [],
            },
            rpcCoverage: undefined,
          },
        ]),
      );
    });
  });
});
