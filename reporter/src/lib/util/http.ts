export const HttpMethods = [
  "get",
  "post",
  "put",
  "delete",
  "options",
  "head",
  "patch",
] as const;
export type HttpMethod = (typeof HttpMethods)[number];

export const METHOD_ORDER_MAP = new Map(
  HttpMethods.map((method, i) => [method, i]),
);

export function toMethod(rawMethod: string): HttpMethod | undefined {
  const method = rawMethod.toLowerCase() as HttpMethod;
  if (HttpMethods.includes(method)) {
    return method;
  }
  return undefined;
}
