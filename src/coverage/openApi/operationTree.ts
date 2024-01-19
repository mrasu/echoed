import { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { normalizePath, removeQueryAndHashFromPath } from "@/util/url";
import { toMethod } from "@/type/http";
import { Operation } from "@/coverage/openApi/operation";
import { OperationNode } from "@/coverage/openApi/operationNode";

export const PathWildcard = Symbol("pathWildcard");

export type OpenAPIPathItemObject =
  | OpenAPIV3.PathItemObject
  | OpenAPIV3_1.PathItemObject
  | OpenAPIV2.PathItemObject;

function findBasePath(doc: OpenAPI.Document): string {
  if ("swagger" in doc) {
    return removeLastSlash(doc.basePath ?? "");
  } else if ("servers" in doc) {
    if (!doc.servers) {
      return "";
    }
    if (doc.servers.length === 0) {
      return "";
    }
    const server = doc.servers[0];

    const baseUrl = server.url;
    const url = baseUrl.replace(/\{(.+?)}/g, (match, p1: string) => {
      if (server.variables && server.variables[p1]) {
        return server.variables[p1].default;
      }
      throw new Error(`No variable found for OpenAPI server URL: ${baseUrl}`);
    });
    const basePathName = new URL(url).pathname;

    const path = normalizePath(basePathName);
    return removeLastSlash(path);
  }

  throw new Error(
    `No basePath found from OpenAPI specification: not using v2, v3, v3.1?`,
  );
}

function removeLastSlash(path: string): string {
  return path.replace(/\/$/, "");
}

/**
 * OpenApiOperationTree is a tree to find OpenAPI operation from HTTP path and method.
 *
 * From OpenAPI specification, OpenApiOperationTree holds tree holding Operations through methods and Nodes representing path like below:
 *
 * ```
 * root - node1(api) - node2(users) - node3(*) - GET  (GET  /api/users/*: matches /api/users/1, /api/users/2, ...)
 *     |            |              |           - POST (POST /api/users/*)
 *     |            |              | - GET  (GET  /api/users)
 *     |            |              | - POST (POST /api/users)
 *     |            |
 *     |            | - node4(orders) - POST (POST /api/orders)
 *     |
 *     - GET (GET /)
 * ```
 */
export class OperationTree {
  readonly basePath: string;
  private readonly root: OperationNode;

  static buildFromDocument(
    doc: OpenAPI.Document,
    basePath?: string,
  ): OperationTree {
    let treeBasePath = basePath;
    if (!treeBasePath) {
      treeBasePath = findBasePath(doc);
    }
    treeBasePath = normalizePath(treeBasePath);

    const pathTree = new OperationTree(treeBasePath);
    if (!doc.paths) {
      return pathTree;
    }

    for (const pattern of Object.keys(doc.paths)) {
      const pathObject = doc.paths[pattern];
      if (!pathObject) continue;
      pathTree.add(pattern, pathObject);
    }

    return pathTree;
  }

  constructor(basePath: string) {
    this.basePath = normalizePath(basePath);
    this.root = new OperationNode("");
  }

  add(specPath: string, pathObject: OpenAPIPathItemObject) {
    const parts = normalizePath(specPath).split("/");
    const normalizedParts = parts.map((part) => {
      if (part.match(/^\{(.+)}$/)) return PathWildcard;
      return part;
    });

    this.root.add(normalizedParts, pathObject, specPath);
  }

  get(path: string, method: string): Operation | undefined {
    const parts = this.toNormalizedPathParts(path);

    const normalizedMethod = toMethod(method);
    if (!normalizedMethod) {
      return undefined;
    }
    return this.root.get(parts, normalizedMethod);
  }

  private toNormalizedPathParts(path: string): string[] {
    const pathname = removeQueryAndHashFromPath(path);
    const normalizedPath = normalizePath(pathname);

    const nodePath = normalizedPath.startsWith(this.basePath)
      ? normalizedPath.replace(this.basePath, "")
      : normalizedPath;

    const parts = normalizePath(nodePath).split("/");
    return parts;
  }

  visitOperations(visitor: (operation: Operation) => void) {
    this.root.visitOperations(visitor);
  }
}
