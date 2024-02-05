import { OperationTree } from "@/coverage/openApi/operationTree";
import { buildV2Document } from "@/testUtil/openapi/apiV2";
import { buildV3Document } from "@/testUtil/openapi/apiV3";
import SwaggerParser from "@apidevtools/swagger-parser";

describe("OperationTree", () => {
  describe("buildFromDocument", () => {
    describe("when openapi v2", () => {
      describe("when basePath is not given", () => {
        describe("when basePath is specified in spec", () => {
          it("should build tree with basePath from document", async () => {
            const doc = await SwaggerParser.parse(
              buildV2Document(
                buildV2Document({
                  basePath: "/api/",
                }),
              ),
            );
            const tree = OperationTree.buildFromDocument(doc);
            expect(tree.basePath).toEqual("api");
          });
        });

        describe("when basePath is not specified in spec", () => {
          it("should build tree with basePath from document", async () => {
            const doc = await SwaggerParser.parse(
              buildV2Document({
                basePath: undefined,
              }),
            );
            const tree = OperationTree.buildFromDocument(doc);
            expect(tree.basePath).toEqual("");
          });
        });
      });

      describe("when basePath is given", () => {
        it("should build tree with basePath from given one", async () => {
          const doc = await SwaggerParser.parse(buildV2Document());
          const tree = OperationTree.buildFromDocument(doc, "/hello");
          expect(tree.basePath).toEqual("hello");
        });
      });

      describe("when paths are documented", () => {
        it("should build tree according to the paths", async () => {
          const doc = await SwaggerParser.parse(
            buildV2Document({
              paths: {
                "/users": {
                  get: {
                    responses: {},
                  },
                  post: {
                    responses: {},
                  },
                },
                "/orders": {
                  post: {
                    responses: {},
                  },
                },
              },
            }),
          );
          const tree = OperationTree.buildFromDocument(doc);
          expect(tree.get("/users", "GET")?.specPath).toBe("/users");
          expect(tree.get("/users", "POST")?.specPath).toBe("/users");
          expect(tree.get("/users", "POST")?.method).toBe("post");
          expect(tree.get("/orders", "POST")?.specPath).toBe("/orders");
        });
      });
    });

    describe("when openapi v3", () => {
      describe("when basePath is not given", () => {
        describe("when servers is specified in spec", () => {
          it("should build tree with basePath from servers", async () => {
            const doc = await SwaggerParser.parse(
              buildV3Document({
                servers: [
                  {
                    url: "https://example.com:8080/api",
                  },
                ],
              }),
            );
            const tree = OperationTree.buildFromDocument(doc);
            expect(tree.basePath).toEqual("api");
          });
        });

        describe("when multiple servers are specified in spec", () => {
          it("should build tree with basePath from the first servers", async () => {
            const doc = await SwaggerParser.parse(
              buildV3Document({
                servers: [
                  {
                    url: "https://example.com:8080/api/",
                  },
                  {
                    url: "https://staging.example.com:8080/stg/api",
                  },
                ],
              }),
            );
            const tree = OperationTree.buildFromDocument(doc);
            expect(tree.basePath).toEqual("api");
          });
        });

        describe("when servers has variables in spec", () => {
          it("should build tree with basePath from the first servers", async () => {
            const doc = await SwaggerParser.parse(
              buildV3Document({
                servers: [
                  {
                    url: "https://example.com:{port}/{environment}/api/",
                    variables: {
                      environment: {
                        default: "staging",
                      },
                      port: {
                        default: "8080",
                      },
                    },
                  },
                ],
              }),
            );
            const tree = OperationTree.buildFromDocument(doc);
            expect(tree.basePath).toEqual("staging/api");
          });
        });
      });
    });

    describe("when basePath is given", () => {
      it("should build tree with basePath from given one", async () => {
        const doc = await SwaggerParser.parse(buildV3Document());
        const tree = OperationTree.buildFromDocument(doc, "/hello");
        expect(tree.basePath).toEqual("hello");
      });
    });

    describe("when paths are documented", () => {
      it("should build tree according to the paths", async () => {
        const doc = await SwaggerParser.parse(
          buildV3Document({
            paths: {
              "/users": {
                get: {
                  responses: {},
                },
                post: {
                  responses: {},
                },
              },
              "/orders": {
                post: {
                  responses: {},
                },
              },
            },
          }),
        );
        const tree = OperationTree.buildFromDocument(doc);
        expect(tree.get("/users", "GET")?.specPath).toBe("/users");
        expect(tree.get("/users", "POST")?.specPath).toBe("/users");
        expect(tree.get("/users", "POST")?.method).toBe("post");
        expect(tree.get("/orders", "POST")?.specPath).toBe("/orders");
      });
    });
  });

  describe("add and get", () => {
    describe("when adding path starting with slash", () => {
      describe("when getting path starting with slash", () => {
        it("should return the operation", () => {
          const tree = new OperationTree("");
          tree.add("/users", {
            get: {
              responses: {},
            },
          });
          expect(tree.get("/users", "GET")?.specPath).toBe("/users");
        });
      });

      describe("when getting path not starting with slash", () => {
        it("should return the operation", () => {
          const tree = new OperationTree("");
          tree.add("/users", {
            get: {
              responses: {},
            },
          });
          expect(tree.get("users", "GET")?.specPath).toBe("/users");
        });
      });
    });

    describe("when adding path not starting with slash", () => {
      describe("when getting path starting with slash", () => {
        it("should return the operation", () => {
          const tree = new OperationTree("");
          tree.add("users", {
            get: {
              responses: {},
            },
          });
          expect(tree.get("/users", "GET")?.specPath).toBe("users");
        });
      });
    });

    describe("when adding path ending with slash", () => {
      describe("when getting path ending with slash", () => {
        it("should return the operation", () => {
          const tree = new OperationTree("");
          tree.add("users/", {
            get: {
              responses: {},
            },
          });
          expect(tree.get("users/", "GET")?.specPath).toBe("users/");
        });
      });

      describe("when getting path not ending with slash", () => {
        it("should return the operation only for path ending with slash", () => {
          const tree = new OperationTree("");
          tree.add("users/", {
            get: {
              responses: {},
            },
          });
          expect(tree.get("users", "GET")).not.toBeDefined();
          expect(tree.get("users/", "GET")?.specPath).toBe("users/");
        });
      });
    });

    describe("when adding different method", () => {
      describe("when getting with the same method", () => {
        it("should return the operation", () => {
          const tree = new OperationTree("");
          const path = "users/hello";
          tree.add(path, {
            get: {
              responses: {},
            },
            post: {
              responses: {},
            },
          });
          tree.add(path, {
            put: {
              responses: {},
            },
          });

          expect(tree.get(path, "GET")?.specPath).toBe(path);
          expect(tree.get(path, "GET")?.method).toBe("get");
          expect(tree.get(path, "POST")?.specPath).toBe(path);
          expect(tree.get(path, "POST")?.method).toBe("post");
          expect(tree.get(path, "PUT")?.specPath).toBe(path);
          expect(tree.get(path, "PUT")?.method).toBe("put");
        });
      });
    });

    describe("when adding nested path", () => {
      describe("when getting with the same path", () => {
        it("should return the operation", () => {
          const tree = new OperationTree("");
          tree.add("users/a/b/c/d/e", {
            get: {
              responses: {},
            },
          });
          expect(tree.get("users/a/b/c/d/e", "GET")?.specPath).toBe(
            "users/a/b/c/d/e",
          );
        });
      });

      describe("when adding nested path with the almost same directory", () => {
        it("should return the operation", () => {
          const tree = new OperationTree("");
          tree.add("users/a/b/c/d/e", {
            get: {
              responses: {},
            },
          });
          tree.add("users/a/b/c/d2/e2", {
            get: {
              responses: {},
            },
          });
          expect(tree.get("users/a/b/c/d/e", "GET")?.specPath).toBe(
            "users/a/b/c/d/e",
          );
          expect(tree.get("users/a/b/c/d2/e2", "GET")?.specPath).toBe(
            "users/a/b/c/d2/e2",
          );
        });
      });
    });
  });

  describe("visitOperations", () => {
    describe("when there are multiple operations", () => {
      it("should visit all operations", () => {
        const tree = new OperationTree("");
        tree.add("users", {
          get: {
            responses: {},
          },
          post: {
            responses: {},
          },
        });
        tree.add("users/hello", {
          get: {
            responses: {},
          },
        });
        tree.add("hello", {
          get: {
            responses: {},
          },
        });

        const visited: [string, string][] = [];
        tree.visitOperations((operation) => {
          visited.push([operation.specPath, operation.method]);
        });

        visited.sort();
        expect(visited).toEqual([
          ["hello", "get"],
          ["users", "get"],
          ["users", "post"],
          ["users/hello", "get"],
        ]);
      });
    });
  });
});
