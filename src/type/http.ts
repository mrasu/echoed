export const Methods = [
  "get",
  "post",
  "put",
  "delete",
  "options",
  "head",
  "patch",
] as const;

const MethodsSet = new Set(Methods);
export type Method = (typeof Methods)[number];

export function toMethod(method: string): Method | undefined {
  const normalizedMethod = method.toLowerCase();
  if (!MethodsSet.has(normalizedMethod as Method)) {
    return undefined;
  }
  return normalizedMethod as Method;
}
