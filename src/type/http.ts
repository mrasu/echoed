import { HttpMethod, HttpMethods } from "@shared/type/http";

const MethodsSet = new Set(HttpMethods);
export function toMethod(method: string): HttpMethod | undefined {
  const normalizedMethod = method.toLowerCase();
  if (!MethodsSet.has(normalizedMethod as HttpMethod)) {
    return undefined;
  }
  return normalizedMethod as HttpMethod;
}
