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
